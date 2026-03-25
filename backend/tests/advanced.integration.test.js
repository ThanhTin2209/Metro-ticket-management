const request = require("supertest");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const { connectDB, disconnectDB } = require("../src/config/db");
const User = require("../src/models/user.model");
const RefreshToken = require("../src/models/refreshToken.model");
const MetroEvent = require("../src/models/metroEvent.model");
const Report = require("../src/models/report.model");
const IdempotencyKey = require("../src/models/idempotency.model");
const { resetRateLimitStore } = require("../src/middlewares/rateLimit.middleware");

jest.setTimeout(45000);

let mongoServer;

async function createAdminAndToken() {
  const passwordHash = await bcrypt.hash("123456", 10);
  await User.create({
    name: "System Admin",
    email: "admin@metro.vn",
    password: passwordHash,
    role: "admin",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@metro.vn",
    password: "123456",
  });

  return loginRes.body.data.accessToken;
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.ACCESS_TOKEN_SECRET = "test_access_secret_123";
  process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret_123";
  process.env.ACCESS_TOKEN_EXPIRES = "15m";
  process.env.REFRESH_TOKEN_EXPIRES = "7d";
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
});

afterAll(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

beforeEach(async () => {
  resetRateLimitStore();
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  await MetroEvent.deleteMany({});
  await Report.deleteMany({});
  await IdempotencyKey.deleteMany({});
});

describe("Advanced API features", () => {
  test("register validation should reject invalid payload", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "1",
      unknownField: "x",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("login rate limit should return 429 after limit", async () => {
    const targetEmail = "ratelimit@metro.vn";
    for (let i = 0; i < 11; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post("/api/auth/login").send({
        email: targetEmail,
        password: "wrong-password",
      });
    }

    const blocked = await request(app).post("/api/auth/login").send({
      email: targetEmail,
      password: "wrong-password",
    });

    expect(blocked.statusCode).toBe(429);
  });

  test("users endpoint supports pagination/filter/sort", async () => {
    const adminToken = await createAdminAndToken();
    const hash = await bcrypt.hash("123456", 10);

    await User.create([
      {
        name: "B User",
        email: "b@metro.vn",
        password: hash,
        role: "staff",
      },
      {
        name: "A User",
        email: "a@metro.vn",
        password: hash,
        role: "staff",
      },
      {
        name: "Inspector User",
        email: "inspector@metro.vn",
        password: hash,
        role: "inspector",
      },
    ]);

    const res = await request(app)
      .get("/api/users?page=1&limit=2&role=staff&sortBy=name&sortOrder=asc")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.users.length).toBe(2);
    expect(res.body.data.users[0].name).toBe("A User");
    expect(res.body.data.pagination.total).toBe(2);
  });

  test("report create supports idempotency and csv download", async () => {
    const adminToken = await createAdminAndToken();
    const payload = {
      title: "Weekly Throughput",
      type: "weekly",
      fromDate: "2026-03-01T00:00:00.000Z",
      toDate: "2026-03-07T00:00:00.000Z",
    };

    const create1 = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("Idempotency-Key", "report-key-001")
      .send(payload);
    expect(create1.statusCode).toBe(201);

    const create2 = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("Idempotency-Key", "report-key-001")
      .send(payload);
    expect(create2.statusCode).toBe(201);
    expect(create2.body.data.report._id).toBe(create1.body.data.report._id);

    const conflict = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("Idempotency-Key", "report-key-001")
      .send({
        ...payload,
        title: "Different title",
      });
    expect(conflict.statusCode).toBe(409);

    let current;
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      current = await request(app)
        .get(`/api/reports/${create1.body.data.report._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      if (current.body?.data?.report?.status === "completed") {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, 120);
      });
    }

    expect(current.body.data.report.status).toBe("completed");

    const csv = await request(app)
      .get(`/api/reports/${create1.body.data.report._id}/download`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(csv.statusCode).toBe(200);
    expect(csv.headers["content-type"]).toContain("text/csv");
    expect(csv.text).toContain("totalEntries");
  });

  test("report API should reject when missing Idempotency-Key", async () => {
    const adminToken = await createAdminAndToken();
    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Missing key",
        type: "weekly",
        fromDate: "2026-03-01T00:00:00.000Z",
        toDate: "2026-03-07T00:00:00.000Z",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Idempotency-Key");
  });
});

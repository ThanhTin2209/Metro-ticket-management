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

jest.setTimeout(30000);
let mongoServer;

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
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  resetRateLimitStore();
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  await MetroEvent.deleteMany({});
  await Report.deleteMany({});
  await IdempotencyKey.deleteMany({});
});

describe("Auth + Authorization flow", () => {
  test("register -> login -> me -> refresh -> logout", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Normal User",
      email: "user@example.com",
      password: "123456",
    });
    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.user.email).toBe("user@example.com");

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "123456",
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.data.accessToken).toBeTruthy();
    expect(loginRes.body.data.refreshToken).toBeTruthy();

    const accessToken = loginRes.body.data.accessToken;
    const refreshToken = loginRes.body.data.refreshToken;

    const meRes = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.user.email).toBe("user@example.com");

    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeTruthy();
    expect(refreshRes.body.data.refreshToken).toBeTruthy();
    expect(refreshRes.body.data.refreshToken).not.toBe(refreshToken);

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: refreshRes.body.data.refreshToken });
    expect(logoutRes.statusCode).toBe(200);

    const refreshAgainRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: refreshRes.body.data.refreshToken });
    expect(refreshAgainRes.statusCode).toBe(401);
  });

  test("user cannot access admin endpoint", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "User Role",
      email: "user2@example.com",
      password: "123456",
    });
    expect(registerRes.statusCode).toBe(201);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "user2@example.com",
      password: "123456",
    });
    const accessToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(403);
  });

  test("admin can access users endpoint", async () => {
    const passwordHash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: passwordHash,
      role: "admin",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "123456",
    });

    const accessToken = loginRes.body.data.accessToken;
    const usersRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(usersRes.statusCode).toBe(200);
    expect(Array.isArray(usersRes.body.data.users)).toBe(true);
    expect(usersRes.body.data.users.length).toBeGreaterThanOrEqual(1);
  });

  test("staff can validate ticket entry but passenger cannot", async () => {
    const staffHash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Station Staff",
      email: "staff@metro.vn",
      password: staffHash,
      role: "staff",
    });

    const staffLoginRes = await request(app).post("/api/auth/login").send({
      email: "staff@metro.vn",
      password: "123456",
    });
    const staffToken = staffLoginRes.body.data.accessToken;

    const staffValidateRes = await request(app)
      .post("/api/metro/tickets/TK100/validate-entry")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ stationCode: "ST01" });
    expect(staffValidateRes.statusCode).toBe(200);
    expect(staffValidateRes.body.data.result).toBe("ALLOW_ENTRY");

    const passengerRes = await request(app).post("/api/auth/register").send({
      name: "Passenger",
      email: "passenger@metro.vn",
      password: "123456",
    });
    expect(passengerRes.statusCode).toBe(201);

    const passengerLoginRes = await request(app).post("/api/auth/login").send({
      email: "passenger@metro.vn",
      password: "123456",
    });
    const passengerToken = passengerLoginRes.body.data.accessToken;

    const passengerValidateRes = await request(app)
      .post("/api/metro/tickets/TK100/validate-entry")
      .set("Authorization", `Bearer ${passengerToken}`)
      .send({ stationCode: "ST01" });
    expect(passengerValidateRes.statusCode).toBe(403);
  });

  test("inspector can create manual inspection but staff cannot", async () => {
    const inspectorHash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Ticket Inspector",
      email: "inspector@metro.vn",
      password: inspectorHash,
      role: "inspector",
    });

    const inspectorLoginRes = await request(app).post("/api/auth/login").send({
      email: "inspector@metro.vn",
      password: "123456",
    });
    const inspectorToken = inspectorLoginRes.body.data.accessToken;

    const inspectionRes = await request(app)
      .post("/api/metro/tickets/TK777/manual-inspection")
      .set("Authorization", `Bearer ${inspectorToken}`)
      .send({ reason: "QRCode unreadable" });
    expect(inspectionRes.statusCode).toBe(200);
    expect(inspectionRes.body.data.status).toBe("PENDING_SUPERVISOR_REVIEW");

    const staffHash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Station Staff 2",
      email: "staff2@metro.vn",
      password: staffHash,
      role: "staff",
    });

    const staffLoginRes = await request(app).post("/api/auth/login").send({
      email: "staff2@metro.vn",
      password: "123456",
    });
    const staffToken = staffLoginRes.body.data.accessToken;

    const deniedRes = await request(app)
      .post("/api/metro/tickets/TK777/manual-inspection")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ reason: "Need override" });
    expect(deniedRes.statusCode).toBe(403);
  });
});

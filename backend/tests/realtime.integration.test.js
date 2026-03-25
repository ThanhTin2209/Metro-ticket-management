const http = require("http");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const { io: ioClient } = require("socket.io-client");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const { connectDB, disconnectDB } = require("../src/config/db");
const User = require("../src/models/user.model");
const RefreshToken = require("../src/models/refreshToken.model");
const MetroEvent = require("../src/models/metroEvent.model");
const Report = require("../src/models/report.model");
const IdempotencyKey = require("../src/models/idempotency.model");
const { initializeSocket, closeSocket } = require("../src/realtime/socket");
const { resetRateLimitStore } = require("../src/middlewares/rateLimit.middleware");

jest.setTimeout(45000);

let mongoServer;
let httpServer;
let baseUrl;

function waitForEvent(socket, eventName, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout for ${eventName}`)), timeoutMs);
    socket.once(eventName, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.ACCESS_TOKEN_SECRET = "test_access_secret_123";
  process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret_123";
  process.env.ACCESS_TOKEN_EXPIRES = "15m";
  process.env.REFRESH_TOKEN_EXPIRES = "7d";

  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());

  httpServer = http.createServer(app);
  initializeSocket(httpServer);
  await new Promise((resolve) => {
    httpServer.listen(0, resolve);
  });
  const addr = httpServer.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(async () => {
  await closeSocket();
  await new Promise((resolve) => httpServer.close(resolve));
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

describe("Realtime events", () => {
  test("socket rejects connection without token", async () => {
    await expect(
      new Promise((resolve, reject) => {
        const client = ioClient(baseUrl, {
          transports: ["websocket"],
          autoConnect: true,
        });
        client.on("connect", () => {
          client.close();
          reject(new Error("should not connect"));
        });
        client.on("connect_error", (err) => {
          client.close();
          resolve(err.message);
        });
      })
    ).resolves.toBe("Unauthorized");
  });

  test("inspector receives manual inspection realtime event", async () => {
    const hash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Inspector",
      email: "inspector@metro.vn",
      password: hash,
      role: "inspector",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "inspector@metro.vn",
      password: "123456",
    });
    const token = loginRes.body.data.accessToken;

    const client = ioClient(baseUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    await waitForEvent(client, "socket.ready");

    const eventPromise = waitForEvent(client, "metro.ticket.manualInspectionCreated");

    const triggerRes = await request(app)
      .post("/api/metro/tickets/TK999/manual-inspection")
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "QR damaged at gate" });
    expect(triggerRes.statusCode).toBe(200);

    const payload = await eventPromise;
    expect(payload.ticketCode).toBe("TK999");
    expect(payload.status).toBe("PENDING_SUPERVISOR_REVIEW");

    client.close();
  });

  test("admin should receive report realtime events", async () => {
    const hash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Admin",
      email: "admin@metro.vn",
      password: hash,
      role: "admin",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@metro.vn",
      password: "123456",
    });
    const token = loginRes.body.data.accessToken;

    const client = ioClient(baseUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    await waitForEvent(client, "socket.ready");
    const createdPromise = waitForEvent(client, "report.created");
    const statusChangedPromise = waitForEvent(client, "report.statusChanged");

    const createRes = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", "report-realtime-001")
      .send({
        title: "Realtime report",
        type: "weekly",
        fromDate: "2026-03-01T00:00:00.000Z",
        toDate: "2026-03-07T00:00:00.000Z",
      });

    expect(createRes.statusCode).toBe(201);
    const createdPayload = await createdPromise;
    expect(createdPayload.reportId).toBe(String(createRes.body.data.report._id));

    const changedPayload = await statusChangedPromise;
    expect(changedPayload.reportId).toBe(String(createRes.body.data.report._id));
    expect(["processing", "completed"]).toContain(changedPayload.status);

    client.close();
  });
});

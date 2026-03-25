const dotenv = require("dotenv");
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { initializeSocket } = require("./realtime/socket");

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDB();
    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running at http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DB connection failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };

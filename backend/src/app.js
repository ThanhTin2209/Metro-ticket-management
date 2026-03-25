const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const metroRoutes = require("./routes/metro.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes = require("./routes/admin.routes");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/metro", metroRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

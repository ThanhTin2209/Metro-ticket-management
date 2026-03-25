const mongoose = require("mongoose");

async function connectDB(mongoUri = process.env.MONGO_URI) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};

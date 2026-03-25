const crypto = require("crypto");

function calculateHash(data) {
  const str = typeof data === "string" ? data : JSON.stringify(data || {});
  return crypto.createHash("sha256").update(str).digest("hex");
}

module.exports = { calculateHash };

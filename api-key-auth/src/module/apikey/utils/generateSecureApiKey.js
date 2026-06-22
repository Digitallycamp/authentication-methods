const crypto = require("crypto");
const generateSecureApiKey = (
  environment,
) => {
  const screteByte = crypto
    .randomBytes(32)
    .toString("hex");

  const prefxi =
    environment === "live"
      ? "sk_live_"
      : "sk_test_";

  const fullKey = `${prefxi}${screteByte}`;
  const hashedKey = crypto
    .createHash("sha256")
    .update(fullKey)
    .digest("hex");
  const keyHint = `${prefxi}${screteByte.substring(0, 4)}...`;

  return {
    fullKey,
    hashedKey,
    keyHint,
  };
};

module.exports = generateSecureApiKey;

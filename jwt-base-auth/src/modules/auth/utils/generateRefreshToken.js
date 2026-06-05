require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

module.exports = generateRefreshToken;

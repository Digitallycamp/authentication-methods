require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 5 * 60 * 1000, // 5 minutes
  });
};

module.exports = generateAccessToken;

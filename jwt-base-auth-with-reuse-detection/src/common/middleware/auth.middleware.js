const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized, Access Token missing and is Required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.exp < Date.now() / 1000) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized, Invalid Access Token" });
    }
    req.user = decoded; // Attach decoded token to request object
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized, Invalid Access Token" });
  }
};

module.exports = auth;

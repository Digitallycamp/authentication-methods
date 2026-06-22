const AppError = require("./AppError");
const { StatusCodes } = require("http-status-codes");

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

module.exports = BadRequestError;

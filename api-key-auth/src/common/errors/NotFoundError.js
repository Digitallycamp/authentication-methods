const AppError = require("./AppError");
const { StatusCodes } = require("http-status-codes");

class NotFoundError extends AppError {
  constructor(resource = "Resources") {
    super(`${resource} not found`, StatusCodes.NOT_FOUND);
  }
}
module.exports = NotFoundError;

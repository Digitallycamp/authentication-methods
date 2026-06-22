const {
  getPresident,
  getPresidents,
} = require("./presidents.repository.js");
const NotFoundError = require("../../common/errors/NotFoundError.js");
const BadRequestError = require("../../common/errors/BadRequestError.js");
const logger = require("../../common/logger/logger.js");

class PresidentService {
  async getPresidentData(id) {
    logger.info(
      "Started to fetch presidents data for ",
      id,
    );
    try {
      if (!id)
        throw new BadRequestError(
          "Bad request",
        );
      const president =
        await getPresident(id);

      if (!president) {
        throw new NotFoundError(id);
      }

      logger.info(
        "President data fetch",
      );
      return president;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async getPresidentsData(
    query,
    options = {},
  ) {
    try {
      logger.info(
        "FECTHING PRESIDNETS",
      );
      const presidents =
        await getPresidents(
          query,
          options,
        );
      logger.info(
        " PRESIDNETS fetched",
      );
      return presidents;
    } catch (err) {
      logger.error(
        " failed to fetch data",
      );
      throw err;
    }
  }
}

const presidentService =
  new PresidentService();

module.exports = presidentService;

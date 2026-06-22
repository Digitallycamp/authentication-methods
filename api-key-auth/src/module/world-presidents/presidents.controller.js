const presidentService = require("./presidents.services");
const catchAsync = require("../../utils/catchAsync.js");

const presidentController = {
  getAPresident: catchAsync(
    async (req, res) => {
      const { id } = req.params;
      const data =
        await presidentService.getPresidentData(
          id,
        );

      res.status(200).json({
        status: "success",
        message:
          "President list retrived successfully!",
        data: data,
      });
    },
  ),
  getAPresidents: async (req, res) => {
    console.log(req.apiEnvironment);
    try {
      const searchFilter =
        req.apiEnvironment === "live"
          ? {}
          : { environment: "test" };

      const page = Math.max(
        1,
        parseInt(req.query.page, 10) ||
          1,
      );

      const limit = Math.max(
        1,
        Math.min(
          parseInt(
            req.query.limit,
            10,
          ) || 20,
          100,
        ),
      );

      const skip = (page - 1) * limit;
      console.log(searchFilter);
      const data =
        await presidentService.getPresidentsData(
          searchFilter,
          {
            skip,
            limit,
          },
        );

      res.status(200).json({
        status: "success",
        message:
          "President list retrived successfully!",
        result: data.length,
        data: data,
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        message: err.message,
      });
    }
  },
};

module.exports = presidentController;

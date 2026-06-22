const express = require("express");
const presidentController = require("./presidents.controller");
const presidentRouter =
  express.Router();
const authenticateApiKey = require("../../common/middleware/auhenticateApiKey.middleware.js");
presidentRouter.get(
  "/presidents",
  authenticateApiKey,
  presidentController.getAPresidents,
);
presidentRouter.get(
  "/presidents/:id",
  presidentController.getAPresident,
);

module.exports = presidentRouter;

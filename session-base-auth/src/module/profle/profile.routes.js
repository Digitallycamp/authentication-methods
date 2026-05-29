const express = require("express");
const profileController = require("./profile.controller.js");
const auth = require("../../common/middleware/auth.middleware.js");

const ProfileRouter = express.Router();
ProfileRouter.get("/me", auth, profileController.getProfile);
ProfileRouter.patch("/me", auth, profileController.updateProfile);

module.exports = ProfileRouter;

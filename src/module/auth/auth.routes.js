const express = require("express");
const authController = require("./auth.controller.js");
const auth = require("../../common/middleware/auth.middleware.js");

const authRouter = express.Router();
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/google", authController.googleAuth);
authRouter.get("/me", auth, authController.authenticatedUser);
module.exports = authRouter;

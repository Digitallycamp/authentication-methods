const express = require("express");
const authController = require("./auth.controller.js");
const auth = require("../../common/middleware/auth.middleware.js");
const authorizeRole = require("../../common/middleware/authorizeRole.js");
const authRouter = express.Router();
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", authController.logout);
authRouter.post("/google", authController.googleAuth);
authRouter.get(
  "/me",
  auth,
  authorizeRole("subscriber"),
  authController.authenticatedUser,
);
authRouter.get("/settings/devices", auth, authController.settings);
authRouter.delete(
  "/settings/devices/:id",
  auth,
  authController.terminateSettings,
);

authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
module.exports = authRouter;

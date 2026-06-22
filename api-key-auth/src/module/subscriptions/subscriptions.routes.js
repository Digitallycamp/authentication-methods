const express = require("express");
const subscriptions = require("./subscriptions.controller.js");
const auth = require("../../common/middleware/auth.middleware.js");
const subscriptionRouter =
  express.Router();

subscriptionRouter.post(
  "/create",
  auth,
  subscriptions.createSubscription,
);
subscriptionRouter.get(
  "/plans",
  subscriptions.getPlans,
);
subscriptionRouter.post(
  "/payment-webhook",
  subscriptions.paymentWebhook,
);

module.exports = subscriptionRouter;

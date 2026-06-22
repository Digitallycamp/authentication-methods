require("dotenv").config();
const crypto = require("crypto");
const {
  Subscription,
  Transaction,
} = require("./subscriptions.model.js");

const catchAsync = require("../../utils/catchAsync.js");
const PAYSTACK_CALLBACK_URL =
  process.env.PAYSTACK_CALLBACK_URL;
const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY;

const subscriptions = {
  createSubscription: catchAsync(
    async (req, res) => {
      console.log(req.body);
      const userId =
        req.session?.user?.id ||
        req.body.userId;
      const email =
        req.session?.user?.email ||
        req.body.email;

      const plan = req.body.plan;
      const amount = req.body.amount;
      if (
        !userId ||
        !email ||
        !plan ||
        !amount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "userId, email, amount and plan are required to initialize a subscription",
        });
      }

      const requestBody = {
        email,
        plan,
        amount,
        callback_url:
          PAYSTACK_CALLBACK_URL,
        metadata: {
          userId,
          custom_note:
            "Live subscription for user",
        },
      };

      const paystackRes = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            requestBody,
          ),
        },
      );

      const result =
        await paystackRes.json();

      if (!result.status) {
        return res.status(400).json({
          success: false,
          message:
            result.message ||
            "Paystack initialization failed",
          details: result,
        });
      }

      await Transaction.create({
        user_id: userId,
        plan_id: plan,
        reference:
          result.data.reference,
        authorization_url:
          result.data.authorization_url,
        access_code:
          result.data.access_code,
        amount: req.body.amount || 0,
      });

      return res.status(200).json({
        success: true,
        authorization_url:
          result.data.authorization_url,
      });
    },
  ),
  getPlans: catchAsync(
    async (req, res) => {},
  ),
  paymentWebhook: catchAsync(
    async (req, res) => {
      console.log(
        "top webhook",
        req.body,
      );
    },
  ),
};

module.exports = subscriptions;

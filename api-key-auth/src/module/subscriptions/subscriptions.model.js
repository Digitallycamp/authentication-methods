const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "monthly",
    },
    plan_id: { type: String },
  },
  {
    timestamps: true,
  },
);

const transactionSchema =
  new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "User",
        require: true,
      },
      plan_id: {
        type: String,
        require: true,
      },

      reference: {
        type: String,
        required: true,
        unique: true,
      },
      access_code: { type: String },
      authorization_url: {
        type: String,
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: [
          "pending",
          "success",
          "failed",
        ],
        default: "pending",
      },
    },
    {
      timestamps: true,
    },
  );
const subscriptionSchema =
  new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types
          .ObjectId,
        ref: "User",
        require: true,
        unique: true,
      },
      plan_id: {
        type: String,
        require: true,
      },

      status: {
        type: String,
        enum: [
          "active",
          "canceled",
          "incomplete",
          "past_due",
          "attention",
        ],
        default: "attention",
      },
      next_payment_date: {
        type: Date,
        required: true,
      },
      subscription_code: {
        type: String,
      },

      paystack_customer_id: {
        type: String,
        required: true,
      },

      email_token: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  );

const Plan = mongoose.model(
  "Plans",
  planSchema,
);
const Subscription = mongoose.model(
  "Subscriptions",
  subscriptionSchema,
);
const Transaction = mongoose.model(
  "Transactions",
  transactionSchema,
);
module.exports = {
  Plan,
  Subscription,
  Transaction,
};

const mongoose = require("mongoose");

const apikeySchema =
  new mongoose.Schema(
    {
      ownerId: {
        type: mongoose.Schema.Types
          .ObjectId,
        required: true,
        ref: "User",
      },
      keyHint: {
        type: String,
        required: true,
      },
      hashedKey: {
        type: String,
        required: true,
        unique: true,
      },
      api_key: {
        type: String,
        required: true,
        unique: true,
      },
      scopes: [
        {
          type: String,
          default: ["read:data"],
        },
      ],
      isActive: {
        type: Boolean,
        default: true,
      },
      isSubscriptionActive: {
        type: Boolean,
        default: false,
      },
      tier: {
        type: String,
        enum: ["free", "paid"],
        default: "free",
      },
      environment: {
        type: String,
        enum: ["test", "live"],
        required: true,
      },

      lastUsedAt: { type: Date },
    },
    { timestamps: true },
  );

module.exports = mongoose.model(
  "ApiKey",
  apikeySchema,
);

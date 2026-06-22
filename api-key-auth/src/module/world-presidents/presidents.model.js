const mongoose = require("mongoose");

const presidentsSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      environment: { type: String },

      year_in_office: [
        { type: String },
      ],
    },
    { timestamps: true },
  );

module.exports = mongoose.model(
  "Presidents",
  presidentsSchema,
);

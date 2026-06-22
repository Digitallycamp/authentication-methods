const crypto = require("crypto");
const Apikey = require("../../module/apikey/apikey.model");

const authenticateApiKey = async (
  req,
  res,
  next,
) => {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"].split(
      " ",
    )[1];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message:
        "Api key is muissing . PLEASE provide api key im header",
    });
  }
  try {
    const incomingHash = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");

    const keyRecord =
      await Apikey.findOne({
        hashedKey: incomingHash,
      });

    if (
      !keyRecord ||
      !keyRecord.isActive
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid or disabled API KEY",
      });
    }

    req.apiKeyOwnerId =
      keyRecord.ownerId;
    req.apiKeyOwnerId = keyRecord;

    if (
      keyRecord.environment === "test"
    ) {
      req.apiEnvironment = "test";
      return next();
    }
    if (
      keyRecord.environment === "live"
    ) {
      if (
        !keyRecord.isSubscriptionActive
      ) {
        return res.status(402).json({
          success: false,
          message:
            "Payment required. Subscription inactive",
        });
      }
      req.apiEnvironment = "live";
      return next();
    }
  } catch (error) {
    console.log(error);
    return res.status(402).json({
      success: false,
      message: "Inernal serever error",
    });
  }
};

module.exports = authenticateApiKey;

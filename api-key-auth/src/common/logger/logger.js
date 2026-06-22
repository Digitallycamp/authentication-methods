const winston = require("winston");

const myCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
  },
  colors: {
    info: "green",
    warn: "yellow",
    error: "red",
  },
};

const logger = winston.createLogger({
  level: myCustomLevels.levels,
  level: "info",
  format: winston.format.json(),
  //   defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),

    new winston.transports.File({ filename: "combined.log" }),
  ],
});

winston.addColors(myCustomLevels.colors);

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;

require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const {
  MongoStore,
} = require("connect-mongo");
const app = require("./app.js");
const authRouter = require("./module/auth/auth.routes.js");
const profileRouter = require("./module/profle/profile.routes.js");
const presidentRouter = require("./module/world-presidents/president.routes.js");
const subscriptionRouter = require("./module/subscriptions/subscriptions.routes.js");
const connectDb = require("./common/db/connetDb.js");
const erroMiddleWare = require("./common/middleware/error.middleware.js");
const AppError = require("./common/errors/AppError.js");
const {
  StatusCodes,
} = require("http-status-codes");
const port = process.env.PORT || 8000;
const logger = require("./common/logger/logger.js");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
  }),
);

app.use(express.json());
app.use(
  session({
    name: "personal_blog_session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60 * 1000, // Session expiration time in seconds (1 day)
    }),
    cookie: {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production"
          ? true
          : false, // Set to true if using HTTPS in production
      maxAge: 1000 * 24 * 60 * 60, // Session expires after 1 day
      sameSite: "lax", // Required for cross-site cookies
      path: "/", // Cookie is valid for the entire site
    },
  }),
);

//routes heer
app.use("/api/v1/auth", authRouter);
app.use(
  "/api/v1/profile",
  profileRouter,
);
app.use(
  "/api/v1/world",
  presidentRouter,
);

app.use(
  "/api/v1/subscriptions",
  subscriptionRouter,
);

app.all(
  "/api/v1/*splat",
  (req, res, next) => {
    next(
      new AppError(
        ` Cant find ${req.originalUrl} on this server`,
        StatusCodes.NOT_FOUND,
      ),
    );
  },
);
const startServer = async () => {
  logger.info("Starting server..");
  await connectDb();
  app.listen(port, () => {
    // logger.info("Server started..");
    console.log(
      `Server is running on port ${port}`,
    );
  });
};
startServer();

app.use(erroMiddleWare);

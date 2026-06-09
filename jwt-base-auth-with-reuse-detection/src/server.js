require("dotenv").config();

const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");

const app = require("./app.js");
const authRouter = require("./modules/auth/auth.routes.js");
const profileRouter = require("./modules/profle/profile.routes.js");

const connectDb = require("./common/db/connetDb.js");

const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());
app.use(cookieParser());

//routes heer
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);

const startServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
startServer();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const { User } = require("../user/user.model.js");
const { RefreshToken } = require("../user/user.model.js");
const emailService = require("../email/services/email.service.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("./utils/generateAccessToken.js");
const generateRefreshToken = require("./utils/generateRefreshToken.js");
const { StatusCodes } = require("http-status-codes");
const os = require("os");

const authController = {
  register: async (req, res) => {
    const { username, email, password } = req.body;
    try {
      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const existingUser = await User.findOne({ email, username });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({ username, email, password });
      await newUser.save();

      return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error during registration:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // login user by jwt token
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

    // user.refreshToken = refreshToken;
    // await user.save();

    if (
      req.get("User-Agent").includes("Android") ||
      req.get("User-Agent").includes("iPhone ") ||
      req.get("User-Agent").includes("iPad")
    ) {
      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        ipAdddress: req.ip,
        userAgent: req.get("User-Agent"),
        expiresAt,
      });

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        role: user.role,
      });
    }

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      expiresAt,
    });

    res.cookie("jw-base-auth", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Set to true if using HTTPS in production
      maxAge: 1000 * 24 * 60 * 60 * 7, // Session expires after 7 days
      sameSite: "lax", // Required for cross-site cookies
      path: "/", // Cookie is valid for the entire site
    });
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      role: user.role,
    });
  },

  refreshToken: async (req, res) => {
    const refreshToken = req.cookies["jw-base-auth"] || req.body.refreshToken;
    console.log("Received refresh token:", refreshToken);
    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access Denied, No Refresh Token " });
    }

    try {
      const storedToken = await RefreshToken.findOne({ token: refreshToken });
      if (!storedToken) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Token is invalid or Revoked" });
      }

      //-----RESUSE DETECTION LOGIC STARTS HERE-----
      if (!storedToken.isValid) {
        if (storedToken.revokeReason === "Refreshed") {
          await RefreshToken.updateMany(
            { userId: storedToken.userId, ipAddress: storedToken.ipAddress },
            { $set: { isValid: false, revokeReason: "Breach Detected" } },
          );
          res.clearCookie("jw-base-auth");
          return res.status(StatusCodes.FORBIDDEN).json({
            message:
              "Token reuse detected. All sessions from this device have been revoked.",
          });
        }
        //-----RESUSE DETECTION LOGIC ends HERE-----
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Token is invalid or Revoked" });
      }

      // continue from here in next class: I see an issue of Order here. We need to verify the token first before checking the database, otherwise we are doing an unnecessary database query for an invalid token. So we should verify the token first, then check if the user exists in the database and if the refresh token matches the one stored for that user. If everything is valid, we can generate a new access token and return it to the client.
      const decoded = await jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET,
      );
      const user = await User.findById(decoded.id);
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
      }

      storedToken.isValid = false;
      storedToken.revokeReason = "Refreshed";
      await storedToken.save();

      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const newRefreshToken = generateRefreshToken(payload);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

      await RefreshToken.create({
        userId: user._id,
        token: newRefreshToken,
        parentToken: refreshToken,
        ipAdddress:
          req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.get("User-Agent"),
        expiresAt,
      });

      const newAccessToken = generateAccessToken(payload);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false, // Set to true if using HTTPS in production
        maxAge: 1000 * 24 * 60 * 60 * 7, // Session expires after 7 days
        sameSite: "lax", // Required for cross-site cookies
        path: "/", // Cookie is valid for the entire site
      });
      return res.json({ accessToken: newAccessToken });
    } catch (err) {
      console.error("Error during token refresh:", err);
    }
  },
  googleAuth: async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Google token is required" });
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch Google user info");

      const googleUser = await response.json();
      let user = await User.findOne({ email: googleUser.email });
      if (!user) {
        user = new User({
          username: googleUser.name,
          email: googleUser.email,
          password: googleUser.sub + "snjksnsj", // Generate a random password or use a fixed string since it's not used for Google-authenticated users
          provider: "google",
        });
        await user.save();
      }

      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      if (
        req.get("User-Agent").includes("Android") ||
        req.get("User-Agent").includes("iPhone") ||
        req.get("User-Agent").includes("iPad")
      ) {
        await RefreshToken.create({
          userId: user._id,
          token: refreshToken,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          expiresAt,
        });

        return res.status(StatusCodes.OK).json({
          message: "Login successful",
          accessToken,
          refreshToken,
          role: user.role,
        });
      }

      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        expiresAt,
      });

      res.cookie("jw-base-auth", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false, // Set to true if using HTTPS in production
        maxAge: 1000 * 24 * 60 * 60 * 7, // Session expires after 7 days
        sameSite: "lax", // Required for cross-site cookies
        path: "/", // Cookie is valid for the entire site
      });

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        role: user.role,
      });
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  authenticatedUser: (req, res) => {
    return res.status(200).json(req.user);
  },

  logout: async (req, res) => {
    const refreshToken = req.cookies["jw-base-auth"];
    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token found" });
    }
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    res.clearCookie("jw-base-auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  },

  forgotPassword: async (req, res) => {
    // Implementation for forgot password
    const { email } = req.body;
    console.log(email);
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist" });
    }

    // Here you would generate a password reset token, save it to the user, and send an email with the reset link
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // send reset password mail
    await emailService.sendPasswordResetEmail(email, user.resetPasswordToken);

    return res
      .status(200)
      .json({ message: "Password reset instructions sent to email" });
  },
  resetPassword: async (req, res) => {
    // Implementation for reset password
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and Password is required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  },

  settings: async (req, res) => {
    try {
      const activeSession = await RefreshToken.find({
        userId: req.user._id,
        isValid: true,
      }).select("ipAdddress userAgent  createdAt _id");
      return res.status(200).json({ activeSessions: activeSession });
    } catch (err) {
      console.error("Error fetching active sessions:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  terminateSettings: async (req, res) => {
    const sessionId = req.params.id;
    try {
      const session = await RefreshToken.deleteOne({
        _id: sessionId,
        userId: req.user._id,
      });
      if (session.deletedCount === 0) {
        return res.status(404).json({ message: "Session not found" });
      }
      return res
        .status(200)
        .json({ message: "Device session terminated successfully" });
    } catch (err) {
      console.error("Error terminating session:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = authController;

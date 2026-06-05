const User = require("../user/user.model.js");
const emailService = require("../email/services/email.service.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("./utils/generateAccessToken.js");
const generateRefreshToken = require("./utils/generateRefreshToken.js");
const { StatusCodes } = require("http-status-codes");

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

    user.refreshToken = refreshToken;
    await user.save();

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
    });
  },

  refreshToken: async (req, res) => {
    const refreshToken = req.cookies["jw-base-auth"];
    console.log("Received refresh token:", refreshToken);
    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access Denied, No Refresh Token " });
    }

    try {
      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Token is invalid or Revoked" });
      }

      // continue from here in next class: I see an issue of Order here. We need to verify the token first before checking the database, otherwise we are doing an unnecessary database query for an invalid token. So we should verify the token first, then check if the user exists in the database and if the refresh token matches the one stored for that user. If everything is valid, we can generate a new access token and return it to the client.
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET,
      );
      console.log("Decoded refresh token:", decoded);
      if (decoded.id !== user._id.toString()) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Token is invalid or Revoked" });
      }

      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const accessToken = generateAccessToken(payload);
      return res.json({ accessToken });
    } catch (err) {
      console.error("Error during token refresh:", err);
    }
  },
  googleAuth: async (req, res) => {
    console.log("Received Google auth request with body:", req.body);
    const { token } = req.body;
    console.log("Received Google token:", cookietoken);
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
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

      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        req.session.user = {
          id: user._id,
          username: user.username,
          email: user.email,
        };

        // FIX: Force the session to save to the store BEFORE responding to the client
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Internal server error" });
          }

          // Now the cookie is safe and the session data is written!
          return res.status(200).json({ message: "Login successful" });
        });
      });
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  authenticatedUser: (req, res) => {
    return res.status(200).json(req.user);
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.clearCookie("personal_blog_session", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "lax", // match your local dev setting
      });
      return res.status(200).json({ message: "Logout successful" });
    });
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
};

module.exports = authController;

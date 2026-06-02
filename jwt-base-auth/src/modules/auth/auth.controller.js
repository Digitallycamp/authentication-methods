const User = require("../user/user.model.js");
const emailService = require("../email/services/email.service.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

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
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 5 * 60 * 1000, // 5 minutes
    });
    return res.status(200).json({ message: "Login successful", token });
  },

  googleAuth: async (req, res) => {
    console.log("Received Google auth request with body:", req.body);
    const { token } = req.body;
    console.log("Received Google token:", token);
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
    return res.status(200).json(req.session.user);
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

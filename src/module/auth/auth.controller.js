const User = require("../user/user.model.js");

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

      return res.status(200).json({ message: "Login successful" });
    });
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
};

module.exports = authController;

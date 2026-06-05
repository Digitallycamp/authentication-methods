const User = require("../user/user.model.js");
const profileController = {
  getProfile: async (req, res) => {
    const user = req.session.user;

    const userData = await User.findById(user.id).select("-password");

    return res
      .status(200)
      .json({ success: true, message: "User profile data", data: userData });
  },

  updateProfile: (req, res) => {
    // Implementation for updating profile
  },
};

module.exports = profileController;

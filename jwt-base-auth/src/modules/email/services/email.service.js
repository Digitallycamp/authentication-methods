const transport = require("../providers/mailtrap/mailtrap.js");
const sender = {
  address: "hello@demomailtrap.com",
  name: "Session Auth App",
};
const emailService = {
  sendWelcomeEmail: async (to) => {
    await transport.sendMail({
      from: sender,
      to,
      subject: "Welcome to Our App",
      text: "Thank you for signing up!",
    });
  },
  sendPasswordResetEmail: async (to, token) => {
    await transport.sendMail({
      from: sender,
      to,
      subject: "Password Reset",
      text: `Click the link to reset your password: http://localhost:5173/auth/reset-password/${token}`,
    });
  },
};

module.exports = emailService;

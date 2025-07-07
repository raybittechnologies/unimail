const { catchAsync } = require("../Utils/catchAsync");
const passport = require("passport");
const { User } = require("../Models");

exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
};

exports.loginGoogle = (req, res) => {
  res.redirect("/auth/google");
};
exports.loginMicrosoft = (req, res) => {
  res.redirect("/auth/microsoft");
};
exports.loginApple = (req, res) => {
  res.redirect("/auth/apple");
};

exports.loginMs = (req, res) => {
  res.redirect("/auth/microsoft");
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};

exports.googleAuthenticate = (req, res, next) => {
  const userId = req.query.userId; // or however you receive it

  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    accessType: "offline",
    prompt: "consent",
    state: userId,
  })(req, res, next);
};

exports.msAuthenticate = (req, res, next) => {
  const userId = req.query.userId;
  passport.authenticate("microsoft", {
    state: userId,
  })(req, res, next);
};

exports.appleAuthentication = (req, res, next) => {
  const userId = req.query.userId;
  passport.authenticate("apple", { state: userId })(req, res, next);
};

// Save IMAP/SMTP Configuration
exports.saveImapConfig = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    smtp_host,
    smtp_port,
    smtp_username,
    smtp_password,
    smtp_secure,
    smtp_require_tls,
  } = req.body;

  // Validate required fields
  if (!smtp_host || !smtp_port || !smtp_username || !smtp_password) {
    return res.status(400).json({
      error: "Missing required IMAP configuration fields",
    });
  }

  // Validate port number
  if (isNaN(smtp_port) || smtp_port < 1 || smtp_port > 65535) {
    return res.status(400).json({
      error: "Invalid SMTP port number",
    });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Update user with IMAP configuration
  await user.update({
    smtp_host,
    smtp_port: parseInt(smtp_port),
    smtp_username,
    smtp_password,
    smtp_secure: smtp_secure || false,
    smtp_require_tls: smtp_require_tls !== false, // default to true
  });

  res.status(200).json({
    success: true,
    message: "IMAP configuration saved successfully",
    config: {
      host: smtp_host,
      port: smtp_port,
      username: smtp_username,
      secure: smtp_secure,
      requireTls: smtp_require_tls,
    },
  });
});

// Get IMAP Configuration
exports.getImapConfig = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Only return configuration if it exists
  if (!user.smtp_host) {
    return res.status(404).json({
      error: "IMAP configuration not found",
      message: "Please configure your email settings first",
    });
  }

  res.status(200).json({
    success: true,
    config: {
      host: user.smtp_host,
      port: user.smtp_port,
      username: user.smtp_username,
      secure: user.smtp_secure,
      requireTls: user.smtp_require_tls,
    },
  });
});

// Delete IMAP Configuration
exports.deleteImapConfig = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Clear IMAP configuration
  await user.update({
    smtp_host: null,
    smtp_port: null,
    smtp_username: null,
    smtp_password: null,
    smtp_secure: null,
    smtp_require_tls: null,
  });

  res.status(200).json({
    success: true,
    message: "IMAP configuration deleted successfully",
  });
});

exports.saveImapInfo = catchAsync(async (req, res, next) => {
  const { smtp_host, smtp_port, smtp_username, smtp_password } = req.body;

  const newSmtpUser = await User.create({
    smtp_host,
    smtp_port,
    smtp_username,
    smtp_password,
  });

  res.status(200).json(newSmtpUser);
});

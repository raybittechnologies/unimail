const passport = require("passport");
const {
  googleAuthenticate,
  msAuthenticate,
  loginGoogle,
  loginMicrosoft,
  appleAuthentication,
  loginApple,
  saveImapConfig,
  getImapConfig,
  deleteImapConfig,
  saveImapInfo,
} = require("../Controllers/auth.controller");
const AuthRouter = require("express").Router();

AuthRouter.get("/login/google", loginGoogle);
AuthRouter.get("/login/microsoft", loginMicrosoft);
AuthRouter.get("/login/apple", loginApple);

AuthRouter.get("/google", googleAuthenticate);
AuthRouter.get("/microsoft", msAuthenticate);
AuthRouter.get("/apple", appleAuthentication);

AuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect(`https://unimail.raybitprojects.com`);
    // res.redirect("http://localhost:5173");
  }
);

console.log(`${process.env.PROD_URL}`);

AuthRouter.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    // successRedirect: `${process.env.PROD_URL}`,
    failureRedirect: `${process.env.PROD_URL}`,
  }),
  function (req, res) {
    // res.redirect("http://localhost:5173");
    res.redirect(`https://unimail.raybitprojects.com`);
  }
);

AuthRouter.post(
  "/apple/callback",
  passport.authenticate("apple", {
    // successRedirect: `${process.env.PROD_URL}`,
    failureRedirect: `${process.env.PROD_URL}`,
  }),
  function (req, res) {
    res.redirect(`https://unimail.raybitprojects.com`);
  }
);

// IMAP Configuration Routes
AuthRouter.post("/imap-config/:id", saveImapConfig);
AuthRouter.get("/imap-config/:id", getImapConfig);
AuthRouter.delete("/imap-config/:id", deleteImapConfig);
AuthRouter.post("/imap-user", saveImapInfo);

module.exports = AuthRouter;

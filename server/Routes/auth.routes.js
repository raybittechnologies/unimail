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

// AuthRouter.get("/login/google", loginGoogle);
// AuthRouter.get("/login/microsoft", loginMicrosoft);
// AuthRouter.get("/login/apple", loginApple);

AuthRouter.get("/login/google", googleAuthenticate);
AuthRouter.get("/login/microsoft", msAuthenticate);
AuthRouter.get("/login/apple", appleAuthentication);

AuthRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login", session: false },
    (err, user, info) => {
      // Extract and parse state
      let parsedState = {};
      try {
        parsedState = JSON.parse(decodeURIComponent(req.query.state));
      } catch (err) {
        console.error("Failed to parse state:", err);
      }

      const redirectUrl = parsedState.redirectUrl || "/";
      return res.redirect(redirectUrl);
    }
  )(req, res, next); // <<-- important: invoke the returned middleware!
});

// AuthRouter.get(
//   "/microsoft/callback",
//   passport.authenticate("microsoft", {
//     // successRedirect: `${process.env.PROD_URL}`,
//     failureRedirect: `${process.env.PROD_URL}`,
//   }),
//   function (req, res) {
//     const { state } = req.query;

//     let parsedState = {};
//     try {
//       parsedState = JSON.parse(decodeURIComponent(state));
//     } catch (err) {
//       console.error("Failed to parse OAuth state param:", err);
//     }

//     const redirectUrl = parsedState.redirectUrl || "/";

//     return res.redirect(redirectUrl);
//   }
// );

AuthRouter.get("/microsoft/callback", (req, res, next) => {
  passport.authenticate(
    "microsoft",
    { failureRedirect: `${process.env.PROD_URL}`, session: false },
    (err, user, info) => {
      // const { state } = req.query;
      // let parsedState = {};

      // try {
      //   parsedState = JSON.parse(decodeURIComponent(state));
      // } catch (err) {
      //   console.error("Failed to parse OAuth state param:", err);
      // }

      // const redirectUrl = parsedState.redirectUrl || "/";
      return res.redirect("https://robomailer.raybitprojects.com");
    }
  )(req, res, next); // 👈 important: invoke the middleware
});

AuthRouter.post(
  "/apple/callback",
  passport.authenticate("apple", {
    // successRedirect: `${process.env.PROD_URL}`,
    // successRedirect: `${process.env.PROD_URL}`,
    // failureRedirect: `${process.env.PROD_URL}`,
  }),
  function (req, res) {
    const { state } = req.query;

    let parsedState = {};
    try {
      parsedState = JSON.parse(decodeURIComponent(state));
    } catch (err) {
      console.error("Failed to parse OAuth state param:", err);
    }

    const redirectUrl = parsedState.redirectUrl || "/";

    res.redirect(redirectUrl);
  }
);

// IMAP Configuration Routes
AuthRouter.post("/imap-config/:id", saveImapConfig);
AuthRouter.get("/imap-config/:id", getImapConfig);
AuthRouter.delete("/imap-config/:id", deleteImapConfig);
AuthRouter.post("/imap-user", saveImapInfo);

module.exports = AuthRouter;

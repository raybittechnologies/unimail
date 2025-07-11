const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("passport-apple");
// const pool = require("./database");
require("dotenv").config();
const AzureOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const axios = require("axios");
const { User } = require("../Models/index");
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const fs = require("fs");
const path = require("path");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.PROD_URL}/auth/google/callback`,
      passReqToCallback: true, // 👈 Needed to access `req.query.state`
    },
    async (req, accessToken, refreshToken, profile, done) => {
      let userId = null;

      try {
        const state = req.query.state;
        const parsedState = JSON.parse(decodeURIComponent(state));
        userId = parsedState.userId;
      } catch (err) {
        console.error("Error parsing state in strategy:", err);
      }

      try {
        let user = await User.findOne({ where: { oauth_id: profile.id } });

        console.log("This is user", user);

        // If user doesn't exist, create a new one
        if (!user) {
          user = await User.create({
            oauth_id: profile.id,
            oauth_provider: "Google",
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
            email: profile.emails[0].value,
            user_id: userId,
          });

          console.log(user);
        } else {
          // Update existing user's OAuth details
          await user.update({
            oauth_id: profile.id,
            oauth_provider: "Google",
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.oauth_id);
});

passport.deserializeUser(async (id, done) => {
  // try {
  //   const [rows] = await pool.query("SELECT * FROM Users WHERE oauth_id = ?", [
  //     id,
  //   ]);
  //   if (rows.length > 0) {
  //     done(null, rows[0]);
  //   } else {
  //     done(null, false);
  //   }
  // } catch (err) {
  //   done(err, null);
  // }
});

//===========================
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${process.env.PROD_URL}/auth/microsoft/callback`,
      scope: ["user.read", "mail.send"],
      tenant: "common", // or your tenant ID
      state: true,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // console.log("This is the state zahid", JSON.pareq.query.state);
      // let userId = null;

      // try {
      //   const state = req.query.state;
      //   const parsedState = JSON.parse(decodeURIComponent(state));
      //   userId = parsedState.userId;
      // } catch (err) {
      //   console.error("Error parsing state in strategy:", err);
      // }
      try {
        let user = await User.findOne({ where: { oauth_id: profile.id } });

        if (!user) {
          user = await User.create({
            oauth_id: profile.id,
            oauth_provider: "Microsoft",
            oauth_access_token: accessToken ? accessToken : "abc",
            oauth_refresh_token: refreshToken ? refreshToken : "abc",
            email: profile.emails[0].value,
            user_id: "1",
          });
        } else {
          await user.update({
            oauth_id: profile.id,
            oauth_provider: "Microsoft",
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
          });

          console.log("This is user", user);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      callbackURL: `${process.env.PROD_URL}/auth/apple/callback`,
      privateKeyLocation: process.env.APPLE_KEY_FILE_PATH,
      passReqToCallback: true,
      scope: ["name", "email"],
    },
    async function (req, accessToken, refreshToken, idToken, profile, done) {
      console.log(profile);
      try {
        const userId = req.query.state;
        if (!userId) return done(new Error("Missing userId"));

        const decoded = JSON.parse(
          Buffer.from(idToken.split(".")[1], "base64").toString()
        );
        const email = decoded.email || `private_${decoded.sub}@apple.relay`;

        let user = await User.findByPk(userId);

        if (!user) {
          user = await User.create({
            email,
            oauth_id: decoded.sub,
            oauth_provider: "Apple",
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
          });
        } else {
          await user.update({
            oauth_id: decoded.sub,
            oauth_provider: "Apple",
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_TEAM_ID,
//       keyID: process.env.APPLE_KEY_ID,
//       privateKeyLocation: process.env.APPLE_KEY_FILE_PATH,
//       callbackURL:
//         "https://55ca-122-161-241-88.ngrok-free.app/auth/apple/callback",
//       scope: ["name", "email"],
//     },
//     (req, accessToken, refreshToken, idToken, profile, cb) => {
//       const tokenData = jwt.decode(idToken);
//       const user = {
//         email: tokenData.email,
//         provider: "apple",
//       };
//       cb(null, user);
//     }
//   )
// );

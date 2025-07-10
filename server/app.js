const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
require("./Utils/passport");
const session = require("express-session");
const AuthRouter = require("./Routes/auth.routes");
const EmailRouter = require("./Routes/email.routes");

// const { initWebSocket } = require("./sockets/socket");

const server = require("http").createServer(app);
// initWebSocket(server);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://reactapp.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "https://rayapps.org",
      "https://unimail.raybitprojects.com",
    ],
    credentials: true,
  })
);

app.options("*", cors());

app.use("/", EmailRouter);
app.use("/auth", AuthRouter);

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// Serve react build in the PIBLIC
app.use(express.static("../client/dist/"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
});

app.all("*", (req, res, next) => {
  res.status(401).json({
    message: "No such api found on this server",
  });
});

module.exports = server;

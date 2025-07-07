const jwt = require("jsonwebtoken");

exports.createSendToken = async (res, req, data) => {
  const tokenOptions = { expiresIn: process.env.JWT_EXPIRY };
  const token = jwt.sign({ data }, process.env.JWT_SECRET, tokenOptions);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    secure: true,
  };

  res.cookie("JWT", token, cookieOptions);
  return token;
};

exports.getTokenData = (req) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];
  else if (req.cookies.JWT) token = req.cookies.JWT;

  if (!token) {
    return null;
  }

  const data = jwt.verify(token, process.env.JWT_SECRET);

  return data;
};

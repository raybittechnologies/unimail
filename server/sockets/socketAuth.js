const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../Models/index");
const AppError = require("../Utils/error");
const Profile = db.userProfile,
  User = db.user;

exports.socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    if (!token) {
      const err = new Error("not authorized");
      err.data = { content: "Please login" };
      throw err;
    }

    const { id, phone, role } = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    if (!phone) throw new Error("Invalid Token");

    let user = await User.findOne({
      where: { id },
      attributes: ["id", "phone", "role", "isActive"],
      include: {
        model: Profile,
        attributes: [
          "id",
          "name",
          "gender",
          "dateOfBirth",
          "timeOfBirth",
          "birthCity",
          "preferredLanguages",
        ],
      },
    });
    if (!user) return next(new AppError(401, "Session expired, login again"));

    user = user.dataValues;
    socket.user = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    };
    next();
  } catch (err) {
    socket.emit("error", "ERROR connection");
    next(err);
  }
};

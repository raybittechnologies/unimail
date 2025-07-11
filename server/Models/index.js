const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

const db = {};
const associations = require("./Associations/index");

db.User = require("./UserModel")(sequelize, DataTypes);
// db.dummy = require("./USERDUMMY")(sequelize, DataTypes);
associations(db);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    // await db.User.sync({ force: true });
    console.log("DB Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = db;

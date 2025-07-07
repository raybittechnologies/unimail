const { Sequelize } = require("sequelize");

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
const associations = require("./Models/Associations/index");

db.User = require("./Models/UserModel")(
  sequelize,
  require("sequelize").DataTypes
);
associations(db);

async function syncDatabase() {
  try {
    // Force sync will drop and recreate tables (use with caution in production)
    await sequelize.sync({ force: false, alter: true });
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();

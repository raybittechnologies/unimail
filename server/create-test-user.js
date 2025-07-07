const { Sequelize } = require("sequelize");
require("dotenv").config();

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

const User = require("./Models/UserModel")(
  sequelize,
  require("sequelize").DataTypes
);

async function createTestUser() {
  try {
    // Test user data
    const testUser = {
      oauth_id: "test-user-123",
      oauth_provider: "test",
      email: "test@example.com",
      oauth_access_token: "test-token",
      oauth_refresh_token: "test-refresh-token",
      appPassword: "test-password",
    };

    // Create the user
    const user = await User.create(testUser);

    console.log("✅ Test user created successfully!");
    console.log("User ID:", user.id);
    console.log("Email:", user.email);
    console.log("OAuth ID:", user.oauth_id);

    return user;
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await sequelize.close();
  }
}

createTestUser();

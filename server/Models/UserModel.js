module.exports = (sequelize, DataTypes) => {
  const Mailing = sequelize.define("mailing", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    oauth_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oauth_provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oauth_access_token: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    oauth_refresh_token: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    appPassword: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: true,
    },
    smtp_host: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    smtp_port: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    smtp_username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    smtp_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    smtp_secure: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    smtp_require_tls: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },

    // 👇 Add the foreign key field
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Must match the table name (case-sensitive)
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });

  return Mailing;
};

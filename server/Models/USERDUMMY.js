module.exports = (sequelize, DataTypes) => {
  const Mailing = sequelize.define("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  });

  return Mailing;
};

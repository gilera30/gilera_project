module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
    { timestamps: true, paranoid: true });
  return Course;
};
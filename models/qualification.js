module.exports = (sequelize, DataTypes) => {
  const Qualification = sequelize.define(
    "Qualification",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
      createdAt: true,
      updatedAt: true,
    }
  );
  return Qualification;
};

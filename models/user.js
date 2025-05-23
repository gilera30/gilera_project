module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      middleName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qualification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: "Qualifications",
          key: "id",
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: "Roles",
          key: "id",
        },
      },
    },
    { timestamps: true, paranoid: true }
  );
  return User;
};

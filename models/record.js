module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define(
    "Record",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: "Users",
          key: "id",
        },
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },
    { timestamps: true, paranoid: true }
  );
  return Record;
};

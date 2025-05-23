const { Sequelize, DataTypes, Op } = require("sequelize");
const bcrypt = require("bcrypt");

const user = require("./user");
const role = require("./role");
const qualification = require("./qualification");
const record = require("./record");
const course = require("./course");
require("dotenv").config();

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
);

const User = user(sequelize, DataTypes);
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 12);
});

const Role = role(sequelize, DataTypes);
const Qualification = qualification(sequelize, DataTypes);
const Record = record(sequelize, DataTypes);
const Course = course(sequelize, DataTypes);

Course.hasMany(Record, { foreignKey: "course_id" }, { onDelete: "CASCADE" });
Record.belongsTo(Course, { foreignKey: "course_id" }, { onDelete: "CASCADE" });
User.hasMany(Record, { foreignKey: "user_id" });
Record.belongsTo(User, { foreignKey: "user_id" });

User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Qualification, { foreignKey: "qualification_id" });
Qualification.hasMany(User, { foreignKey: "qualification_id" });

module.exports = {
  sequelize,
  bcrypt,
  Op,
  User,
  Role,
  Qualification,
  Record,
  Course,
};

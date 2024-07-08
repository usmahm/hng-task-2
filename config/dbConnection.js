const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.NODE_ENV === "test") {
  sequelize = new Sequelize("sqlite::memory:");
} else {
  sequelize = new Sequelize(
    process.env.POSTGRES_DB_NAME, //"db database name",
    process.env.POSTGRES_DB_USER, // "db username",
    process.env.POSTGRES_DB_PASSWORD, // "db password",
    {
      dialect: "postgres",
      host: process.env.POSTGRES_DB_HOST, // "db host",
    }
  );
}

module.exports = sequelize;

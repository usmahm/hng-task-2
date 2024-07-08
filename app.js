const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const sequelize = require("./config/dbConnection");
const sendResponse = require("./utils/sendResponse");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const organisationRoutes = require("./routes/organisationRoutes");

const app = express();

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/api", userRoutes, organisationRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server online!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Requested route doesn't exist!" });
});

// Express built in error handler
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const body = error.body || { message: "An internal error occured" };
  console.log(`\nERROR - statusCode=${status}, body=${JSON.stringify(body)}\n`);
  sendResponse(res, status, body);
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to DB.");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Listening on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("Unable to connect to db");
    console.log(err);
  });

module.exports = app;

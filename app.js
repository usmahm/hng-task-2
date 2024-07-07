const express = require("express");
require("dotenv").config();
const sequelize = require("./config/dbConnection");

const app = express();

app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server online!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Requested route doesn't exist!" });
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

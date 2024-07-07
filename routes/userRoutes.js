const express = require("express");
const isAuth = require("../middlewares/isAuth");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/users/:id", isAuth, userController.getUser);

module.exports = router;

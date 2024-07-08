const express = require("express");
const { findUserByEmail } = require("../models/userModel");

const authController = require("../controllers/authController");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (val) => {
        const user = await findUserByEmail(val);
        if (user) {
          throw new Error("Email already in use");
        }
      })
      .normalizeEmail(),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("password")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Password should be a minimum length of 3"),
  ],
  authController.signup
);

router.post(
  "/login",
  [body("email").trim().notEmpty(), body("password").trim().notEmpty()],
  authController.login
);

module.exports = router;

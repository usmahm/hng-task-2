const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const customValidationResults = require("../utils/customValidationResults");
const sendResponse = require("../utils/sendResponse");
const { password } = require("pg/lib/defaults");

const generateAuthToken = (email, userId) => {
  return jwt.sign(
    {
      email: email,
      userId: userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const signup = async (req, res, next) => {
  try {
    const errors = customValidationResults(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed!");
      error.statusCode = 400;
      error.body = {
        status: "Bad request",
        message: "Registration unsuccessful",
        errors: errors.array(),
      };
      throw error;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    let createdUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
    });

    createdUser = createdUser.dataValues;

    const token = generateAuthToken(createdUser.email, createdUser.userId);

    // console.log("created", createdUser);

    // console.log("RRR", req.body);

    sendResponse(res, 201, {
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: token,
        user: {
          userId: createdUser.userId,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          phone: createdUser.phone,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    let user = await User.findOne({
      where: { email: req.body.email },
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "phone",
        "password",
      ],
    });
    console.log(user);

    if (!user) {
      sendResponse(res, 401, {
        status: "Bad request",
        message: "Authentication failed",
      });
    }

    const match = await bcrypt.compare(req.body.password || "", user.password);
    console.log("MMM", match);
    if (match) {
      const token = generateAuthToken(user.email, user.userId);

      sendResponse(res, 200, {
        status: "success",
        message: "Login successful",
        data: {
          accessToken: token,
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
          },
        },
      });
    } else {
      sendResponse(res, 401, {
        status: "Bad request",
        message: "Authentication failed",
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { createUser, findUserByEmail } = require("../models/userModel");
const customValidationResults = require("../utils/customValidationResults");
const sendResponse = require("../utils/sendResponse");
const { createNewOrganisation } = require("../models/organisationModel");

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
      error.statusCode = 422;
      error.body = {
        status: "Bad request",
        message: "Invalid data provided",
        errors: errors.array(),
        statusCode: 422,
      };
      throw error;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    let createdUser = await createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
    });

    // Create default organisation
    await createNewOrganisation(
      `${createdUser.firstName}'s Organisation`,
      "",
      createdUser
    );

    const token = generateAuthToken(createdUser.email, createdUser.userId);

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
    const errors = customValidationResults(req);
    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 422;
      error.body = {
        status: "Bad request",
        message: "Invalid data provided",
        errors: errors.array(),
        statusCode: 422,
      };
      throw error;
    }

    let user = await findUserByEmail(req.body.email, [
      "userId",
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
    ]);

    if (!user) {
      sendResponse(res, 401, {
        status: "Bad request",
        message: "Authentication failed",
        statusCode: 401,
      });
    }

    const match = await bcrypt.compare(req.body.password || "", user.password);
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
  generateAuthToken,
};

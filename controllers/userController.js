const bcrypt = require("bcrypt");
const { findUserById, getSharedOrgs, User } = require("../models/userModel");
const sendResponse = require("../utils/sendResponse");
const { use } = require("bcrypt/promises");
const { Organisation } = require("../models/organisationModel");
const { Op } = require("sequelize");
const sequelize = require("../config/dbConnection");

const getUser = async (req, res, next) => {
  try {
    // Check instruction to complete task
    const userId = req.params.id;

    if (userId === req.userId) {
      let user = await findUserById(userId, [
        "userId",
        "firstName",
        "lastName",
        "email",
        "phone",
      ]);

      if (!user) {
        const error = new Error();
        throw error;
      }

      sendResponse(res, 200, {
        status: "success",
        message: "User fetched succefully",
        data: user,
      });
    } else {
      const organisations = await getSharedOrgs(req.userId, userId);

      console.log("results", organisations.length, organisations);
      if (organisations.length == 0) {
        const error = new Error();
        error.statusCode = 404;
        error.body = {
          status: "Bad request",
          message: "User not found",
        };
        throw error;
      }

      let user = await findUserById(userId, [
        "userId",
        "firstName",
        "lastName",
        "email",
        "phone",
      ]);

      sendResponse(res, 200, {
        status: "success",
        message: "User fetched succefully",
        data: user,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
};

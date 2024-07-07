const bcrypt = require("bcrypt");
const User = require("../models/User");
const sendResponse = require("../utils/sendResponse");

const getUser = async (req, res, next) => {
  try {
    // Check instruction to complete task
    const userId = req.params.id;

    console.log("USSSS", userId);
    let user = await User.findByPk(userId, {
      attributes: ["userId", "firstName", "lastName", "email", "phone"],
    });

    if (!user) {
      const error = new Error();
      (error.statusCode = 404), (error.message = "User not found");

      throw error;
    }

    sendResponse(res, 200, {
      status: "success",
      message: "User fetched succefully",
      data: user,
    });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};

module.exports = {
  getUser,
};

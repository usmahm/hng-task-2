const Organisation = require("../models/organisation");
const { findUserById, getUserOrganisations } = require("../models/User");
const {
  createNewOrganisation,
  findOrganisationById,
} = require("../models/organisation");
const customValidationResults = require("../utils/customValidationResults");
const sendResponse = require("../utils/sendResponse");

const getOrganisationById = async (req, res, next) => {
  try {
    const organisation = await findOrganisationById(
      req.params.orgId,
      (attributesToInclude = ["orgId", "name", "description"])
    );

    if (!organisation) {
      const error = new Error();
      error.statusCode = 400;
      error.body = {
        status: "Bad Request",
        message: `Organisation doens't not exist!`,
      };
      throw error;
    }

    sendResponse(res, 200, {
      status: "success",
      message: "Organisation data fetched succcessfully",
      data: organisation,
    });
  } catch (err) {
    next(err);
  }
};

const createOrganisation = async (req, res, next) => {
  try {
    const errors = customValidationResults(req);

    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 400;
      error.body = {
        status: "Bad Request",
        message: "Client error",
        // errors: errors.array(),
      };
      throw error;
    }

    const currentUser = await findUserById(req.userId);

    if (!currentUser) {
      throw new Error();
    }

    let createdOrganisation = await createNewOrganisation(
      req.body.name,
      req.body.description,
      currentUser
    );

    console.log("JJJ", createdOrganisation);

    sendResponse(res, 201, {
      status: "success",
      message: "Organisation created successfully",
      data: {
        orgId: createdOrganisation.orgId,
        name: createdOrganisation.name,
        description: createdOrganisation.description,
      },
    });
  } catch (err) {
    console.log("eerer", err);
    next(err);
  }
};

const addUserToOrganisation = async (req, res, next) => {
  try {
    if (!req.body.userId) {
      const error = new Error();
      error.statusCode = 400;
      error.body = {
        status: "Bad Request",
        message: "Client error",
      };
      throw error;
    }

    const user = await findUserById(req.body.userId);

    if (!user) {
      const error = new Error();
      error.statusCode = 400;
      error.body = {
        status: "Bad Request",
        message: `User with user id = ${req.body.userId} doesn't exist!`,
      };
      throw error;
    }

    console.log("ORGG", req.params);
    const organisation = await findOrganisationById(req.params.orgId);
    if (!organisation) {
      const error = new Error();
      error.statusCode = 400;
      error.body = {
        status: "Bad Request",
        message: `Organisation doens't not exist!`,
      };
      throw error;
    }

    await user.addOrganisation(organisation);
    sendResponse(res, 200, {
      status: "success",
      message: "User added to organisation successfully",
    });
  } catch (err) {
    // console.log("err", err);
    next(err);
  }
};

const getAllOrganisations = async (req, res, next) => {
  try {
    const user = await getUserOrganisations(req.userId);

    if (!user) {
      // An internal error, because it shouldn't be possible to reach here since it is protected
      const error = new Error();
    }

    const organisations = user.Organisations;

    console.log("organisations", organisations);

    sendResponse(res, 200, {
      satus: "success",
      message: "User Organisations succefully fetched",
      data: {
        organisations: organisations,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrganisation,
  addUserToOrganisation,
  getOrganisationById,
  getAllOrganisations,
};

const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../middlewares/isAuth");
const organisationController = require("../controllers/organisationController");

const router = express.Router();

router.get(
  "/organisations",
  isAuth,
  organisationController.getAllOrganisations
);

router.post(
  "/organisations",
  isAuth,
  body("name").trim().notEmpty(),
  organisationController.createOrganisation
);

router.post(
  "/organisations/:orgId/users",
  isAuth,
  organisationController.addUserToOrganisation
);

router.get(
  "/organisations/:orgId",
  isAuth,
  organisationController.getOrganisationById
);

module.exports = router;

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

router.get(
  "/organisations/:orgId",
  isAuth,
  organisationController.getOrganisationById
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

module.exports = router;

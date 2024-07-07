const { validationResult } = require("express-validator");

const customValidationResults = validationResult.withDefaults({
  formatter: (error) => ({
    message: error.msg,
    field: error.path,
  }),
});

module.exports = customValidationResults;

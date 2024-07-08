const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnection");

const Organisation = sequelize.define("Organisation", {
  orgId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

const createNewOrganisation = async (name, description, user) => {
  const newOrg = await Organisation.create({
    name: name,
    description: description,
    creatorId: user.userId,
  });

  await user.addOrganisation(newOrg);

  return newOrg;
};

const findOrganisationById = async (orgId, attributesToInclude) => {
  return await Organisation.findByPk(orgId, {
    attributes: attributesToInclude,
  });
};

module.exports = {
  Organisation,
  createNewOrganisation,
  findOrganisationById,
};

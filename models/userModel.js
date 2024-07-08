const { DataTypes, Op } = require("sequelize");

const sequelize = require("../config/dbConnection");
const { Organisation } = require("./organisationModel");

const User = sequelize.define("User", {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
});

// many to many relationship
User.belongsToMany(Organisation, { through: "UserOrganisations" });
Organisation.belongsToMany(User, { through: "UserOrganisations" });

// one to many relationship
Organisation.belongsTo(User, { as: "creator", foreignKey: "creatorId" });
User.hasMany(Organisation, {
  as: "createdOrganisations",
  foreignKey: "creatorId",
});

const createUser = async ({ firstName, lastName, email, password, phone }) => {
  return await User.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    phone: phone,
  });
};

const findUserById = async (userId, attributesToInclude) => {
  return await User.findByPk(userId, {
    attributes: attributesToInclude,
  });
};

const findUserByEmail = async (email, attributesToInclude) => {
  return await User.findOne({
    where: { email: email },
    attributes: attributesToInclude,
  });
};

const getUserOrganisations = async (userId) => {
  return await User.findByPk(userId, {
    include: {
      model: Organisation,
      attributes: ["orgId", "name", "description"],
      through: { attributes: [] },
    },
  });
};

// Added here to prevent cyclic dependency issue
const getSharedOrgs = async (currentUserId, userId) => {
  return await Organisation.count({
    include: [
      {
        model: User,
        where: { userId: { [Op.in]: [currentUserId, userId] } },
        through: { attributes: [] },
      },
    ],
    having: sequelize.literal(`COUNT(DISTINCT "Users"."userId") = 2`),
    group: ["Organisation.orgId"],
  });
};

const findUserOrganisationById = async (
  orgId,
  currentUserId,
  attributesToInclude
) => {
  return await Organisation.findOne({
    where: { orgId: orgId },
    attributes: attributesToInclude,
    include: {
      model: User,
      where: { userId: currentUserId },
      attributes: [],
      through: { attributes: [] },
    },
  });
};

// User.hasMany
module.exports = {
  User,
  findUserById,
  createUser,
  findUserByEmail,
  getUserOrganisations,
  getSharedOrgs,
  findUserOrganisationById,
};

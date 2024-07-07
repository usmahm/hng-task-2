const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnection");
const User = require("./user");

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
});

Organisation.belongsToMany(User, { through: "UserOrganisations" });

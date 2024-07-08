const request = require("supertest");
const jwt = require("jsonwebtoken");

const { generateAuthToken } = require("../controllers/authController");
const sequelize = require("../config/dbConnection");

describe("createAccessToken", () => {
  const userData = {
    email: "4th@gmail.com",
    userId: "randomID",
  };

  it("generates a token that expires in 1 hour", () => {
    const token = generateAuthToken(userData.email, userData.userId);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken)
    expect(decodedToken.exp).toBeLessThanOrEqual(
      Math.round(Date.now() / 1000 + 3600),
      0
    );
  });

  it("includes the correct user details in the token", () => {
    const token = generateAuthToken(userData.email, userData.userId);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    expect(decodedToken.userId).toBe(userData.userId);
    expect(decodedToken.email).toBe(userData.email);
  });
});

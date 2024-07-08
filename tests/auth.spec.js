const request = require("supertest");
const jwt = require("jsonwebtoken");

const { generateAuthToken } = require("../controllers/authController");
const sequelize = require("../config/dbConnection");
const app = require("../app");
const { User } = require("../models/userModel");
const { user } = require("pg/lib/defaults");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe("Token generation", () => {
  const userData = {
    email: "4th@gmail.com",
    userId: "randomID",
  };

  it("verify token expires at the correct time", () => {
    const token = generateAuthToken(userData.email, userData.userId);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken)
    expect(decodedToken.exp).toBeLessThanOrEqual(
      Math.round(Date.now() / 1000 + 3600),
      0
    );
  });

  it("verify correct user details is found in token", () => {
    const token = generateAuthToken(userData.email, userData.userId);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    expect(decodedToken.userId).toBe(userData.userId);
    expect(decodedToken.email).toBe(userData.email);
  });
});

let firstUserOrg;

describe("End-to-End Test for Auth Endpoints", () => {
  let accessToken;
  let userId;
  let expectedOrgName;

  const validUser = {
    firstName: "2ndUser",
    lastName: "Doe",
    email: "2nduser@example.com",
    password: "password123",
    phone: "0101010",
  };

  const invalidUser = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  };

  it("verify register user successfully and contains the expected user details and access token", async () => {
    const response = await request(app).post("/auth/register").send(validUser);

    expectedOrgName = `${validUser.firstName}'s Organisation`;

    const data = response.body.data;
    expect(response.statusCode).toEqual(201);
    expect(data).toHaveProperty("user");
    expect(data.user).toHaveProperty("email", validUser.email);
    expect(data.user).toHaveProperty("firstName", validUser.firstName);
    expect(data.user).toHaveProperty("email", validUser.email);
    expect(data.user).toHaveProperty("phone", validUser.phone);
    expect(data).toHaveProperty("accessToken");

    accessToken = data.accessToken;
    userId = data.user.userId;
  });

  it("verify registration fails when there’s duplicate email", async () => {
    const response = await request(app).post("/auth/register").send(validUser);

    // console.log("response.sdsddfdfdf", response.body);

    expect(response.status).toBe(422);
    expect(response.body.status).toBe("Bad request");
    expect(response.body.message).toBe("Invalid data provided");
    expect(response.body.errors[0].message).toBe("Email already in use");
    expect(response.body.statusCode).toBe(422);
  });

  it("verify registration fails when required fields are missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(invalidUser);

    expectedOrgName = `${validUser.firstName}'s Organisation`;

    expect(response.status).toBe(422);
    expect(response.body.status).toBe("Bad request");
    expect(response.body.message).toBe("Invalid data provided");
    expect(response.body.statusCode).toBe(422);
  });

  it("verify that default organisation created is correctly generated", async () => {
    const user = await User.findByPk(userId);
    const organisations = await user.getOrganisations();

    firstUserOrg = organisations[0].orgId;
    expect(organisations).toHaveLength(1);
    expect(organisations[0].name).toBe(expectedOrgName);
  });

  it("verify user is logged in successfully when a valid credential is provided and contains the expected user details and access token", async () => {
    const response = await request(app).post("/auth/login").send({
      email: validUser.email,
      password: validUser.password,
    });

    const data = response.body.data;
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Login successful");
    expect(data).toHaveProperty("accessToken");
    expect(data.user).toEqual({
      userId: expect.any(String),
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      email: validUser.email,
      phone: validUser.phone,
    });
  });

  it("verify user login fails when a invalid credential is provided", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "random@gmail.com",
      password: "randomass",
    });

    // console.log("response", response.body);
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("Bad request");
    expect(response.body.message).toBe("Authentication failed");
    expect(response.body.statusCode).toBe(401);
  });
});

describe("Organisation", () => {
  let userToken;

  beforeAll(async () => {
    const res = await request(app).post("/auth/register").send({
      firstName: "5thUser",
      lastName: "Smith",
      email: "5thsmith@example.com",
      password: "password123",
    });

    userToken = res.body.token;
  });

  it("verify user's can't see data from organisations they don't have access to", async () => {
    const response = await request(app)
      .get(`/api/organisations/${firstUserOrg}`)
      .set("Authorization", `Bearer ${userToken}`);

    // console.log("RRRsdsdsdds", response.body);
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized to access resource");
  });
});

afterAll(async () => {
  await sequelize.close();
});

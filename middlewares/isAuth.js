const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  try {
    const authToken = req.get("Authorization");
    if (!authToken) {
      throw new Error();
    }

    const decoded = jwt.verify(authToken.split(" ")[1], process.env.JWT_SECRET);
    if (!decoded) {
      throw new Error();
    }

    // console.log("decoded", decoded);
    req.userId = decoded.userId;
  } catch {
    const error = new Error("Unauthorized to access resource");
    error.statusCode = 401;
    error.body = {
      status: "error",
      message: "Unauthorized to access resource",
    };

    next(error);
  }

  next();
};

module.exports = isAuth;

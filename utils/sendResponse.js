const sendResponse = (res, statusCode, body) => {
  res.status(statusCode).json(body);
};

module.exports = sendResponse;

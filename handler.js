const { app, io } = require("./index");
const serverless = require("serverless-http");
exports.expressApp = serverless(app);
exports.connectionHandler = async (event, context) => {
  console.log(event, context);
};

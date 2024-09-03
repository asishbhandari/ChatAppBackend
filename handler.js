const { app, io } = require("./index");
const serverless = require("serverless-http");
exports.expressApp = serverless(app);
exports.connectionHandler = serverless(io);

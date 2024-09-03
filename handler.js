const app = require("./index");
const serverless = require("serverless-http");
const io = require("./index");
exports.expressApp = serverless(app);
exports.connectionHandler = serverless(io);

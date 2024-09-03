const app = require("./index");
const serverless = require("serverless-http");
exports.expressApp = serverless(app);

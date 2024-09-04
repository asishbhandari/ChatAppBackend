const { app } = require("./index");
const serverless = require("serverless-http");
exports.expressApp = serverless(app);
// exports.connectionHandler = async (event) => {
//   const response = {
//     statusCode: 200,
//     body: JSON.stringify("success"),
//   };
//   return response;
// };

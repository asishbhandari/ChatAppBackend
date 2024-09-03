const express = require("express");
const { verifiedToken } = require("../middleware/jwtTokens");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageController");

const messageRouter = express.Router();

messageRouter.get("/:chatId", verifiedToken, allMessages);
messageRouter.post("/", verifiedToken, sendMessage);

module.exports = messageRouter;

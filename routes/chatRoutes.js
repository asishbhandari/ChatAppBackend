const express = require("express");
const { verifiedToken } = require("../middleware/jwtTokens");
const {
  fetchChats,
  accessChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chatControllers");
const chatRouter = express.Router();

chatRouter.post("/", verifiedToken, accessChat);
chatRouter.get("/chats", verifiedToken, fetchChats);
chatRouter.post("/group", verifiedToken, createGroupChat);
chatRouter.put("/rename", verifiedToken, renameGroup);
chatRouter.put("/groupremove", verifiedToken, removeFromGroup);
chatRouter.put("/groupadd", verifiedToken, addToGroup);

module.exports = chatRouter;

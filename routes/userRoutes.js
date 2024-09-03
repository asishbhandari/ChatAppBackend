const express = require("express");
const {
  registerUser,
  authenticateUser,
  allUsers,
} = require("../controllers/userController");
const { verifiedToken } = require("../middleware/jwtTokens");

const userRouter = express.Router();

userRouter.post("/signup", registerUser);
userRouter.post("/login", authenticateUser);
userRouter.get("/allUsers", verifiedToken, allUsers);

module.exports = userRouter;

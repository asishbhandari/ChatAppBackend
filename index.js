const express = require("express");
const dotenv = require("dotenv");
const { createServer } = require("node:http");
const connectDB = require("./DB/connectDataBase");
const userRouter = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/erroMiddleware");
const chatRouter = require("./routes/chatRoutes");
const { Server } = require("socket.io");
const cors = require("cors");
const messageRouter = require("./routes/messageRoutes");
const app = express();

dotenv.config();
connectDB();
const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 5001;

// sockets logics

io.on("connection", (socket) => {
  // console.log("User connected to: ", socket.id);
  socket.on("Setup Connection", (user) => {
    socket.join(user?._id);
    socket.emit("Connected");
  });

  // socket.on("Join Chat", (roomId)=>{
  //   socket.join(roomId);
  // })
  socket.on("New Message", (message) => {
    const chat = message?.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == message.sender._id) return;

      socket.in(user._id).emit("Message Received", message);
    });
    // console.log(message);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

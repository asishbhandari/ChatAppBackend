const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    // console.log("user Id: ", typeof req.userId);
    // console.log("recipient Id: ", recipientId);
    if (!recipientId)
      return res.status(403).send({ message: "Invalid recipient" });

    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.userId } } },
        { users: { $elemMatch: { $eq: recipientId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // to check what is coming from above
    // console.log(chat);

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name profilePhoto email",
    });

    if (chat.length > 0) {
      return res.status(200).send({ message: "success", data: chat[0] });
    }

    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.userId, recipientId],
    };

    const data = await Chat.create(chatData);
    const newChat = await Chat.findOne({ _id: data._id }).populate(
      "users",
      "-password"
    );
    // console.log("newChat: " + newChat);
    return res.status(200).send({ message: "success", data: newChat });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/chats
//@access          Protected
const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.userId } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const result = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name profilePhoto email",
    });

    if (chats.length < 1)
      return res.status(404).send({ message: "No chats found" });
    return res.status(200).send({ message: "Success", data: result });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
  try {
    if (!req?.body?.users || !req?.body?.name) {
      return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req?.body?.users);

    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }
    const admin = await User.findOne({ _id: req.userId });
    users.push(admin);
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: admin,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const currUser = await User.findOne({ _id: req.userId });
  const chat = await Chat.find({ _id: chatId }).populate(
    "groupAdmin",
    "-password"
  );
  if (chat[0]?.groupAdmin?.email === currUser?.email) {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  }
  // else {
  //   res.json({ message: "logic not working" });
  // }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const currUser = await User.findOne({ _id: req.userId });
  const chat = await Chat.find({ _id: chatId }).populate(
    "groupAdmin",
    "-password"
  );
  if (chat[0]?.groupAdmin?.email === currUser?.email) {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};

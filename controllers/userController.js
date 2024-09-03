const { generateToken } = require("../middleware/jwtTokens");
const User = require("../models/userModel");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    const existingUser = await User.findOne({ email });
    if (!image)
      image =
        "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
    if (existingUser)
      return res
        .status(409)
        .send({ message: `User with ${email} already exists` });
    const newUser = await User.create({
      email: email,
      password: password,
      name: name,
      profilePhoto: image,
    });

    if (!newUser)
      return res
        .status(500)
        .send({ message: "Failed to register user try again later" });
    return res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .send({ message: "Email not registered kindly register first" });
    }

    if (user && (await user.comparePassword(password, user.password))) {
      //if user is verified then generate token and send it
      const token = generateToken({ id: user._id });
      const authUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user?.isAdmin,
        profilePhoto: user.profilePhoto,
        token: token,
      };
      return res
        .status(200)
        .send({ message: "Logged in successfully", authUser });
    }
    return res
      .status(409)
      .send({ message: "Email and password does not match" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.userId } });
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = { registerUser, authenticateUser, allUsers };

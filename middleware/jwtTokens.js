const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "3h" });
};

const verifiedToken = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } else res.status(403).send({ message: "Unauthorized access" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error validating token", error: error.message });
  }
};

module.exports = { generateToken, verifiedToken };

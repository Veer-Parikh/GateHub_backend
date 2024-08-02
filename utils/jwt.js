const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ userId: user.userId, phone: user.phone, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
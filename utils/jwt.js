const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRES_IN = '7d';

// Read at call time so dotenv / test overrides are always honoured.
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: getExpiresIn() });
};

const generateToken = (user) => {
  return signToken({ userId: user.userId, phone: user.phone, isAdmin: user.isAdmin });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, signToken, verifyToken };

const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRES_IN = '7d';

// Read at call time so dotenv / test overrides are always honoured.
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;

const signToken = (payload) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-to-a-long-random-string') {
    throw new Error('JWT_SECRET must be configured with a strong secret');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: getExpiresIn() });
};

const generateToken = (user) => {
  return signToken({ userId: user.userId, phone: user.phone, isAdmin: user.isAdmin });
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-to-a-long-random-string') {
    throw new Error('JWT_SECRET must be configured with a strong secret');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, signToken, verifyToken };

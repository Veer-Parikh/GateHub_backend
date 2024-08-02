const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const authenticateSecurity = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = verifyToken(token);
        req.security = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.isAdmin == false) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = {authenticate,authenticateSecurity,authorizeAdmin};
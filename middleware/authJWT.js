const { verifyToken } = require('../utils/jwt');

// Extracts the token from an `Authorization: Bearer <token>` header (null if absent).
const getBearerToken = (req) => {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') {
        return null;
    }
    const [scheme, token] = header.trim().split(/\s+/);
    if (!token || scheme.toLowerCase() !== 'bearer') {
        return null;
    }
    return token;
};

const authenticate = (req, res, next) => {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

const authenticateSecurity = (req, res, next) => {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
    if (!decoded.securityId) {
        return res.status(403).json({ message: 'Access denied. Security staff only.' });
    }
    req.security = decoded;
    next();
};

// Self-sufficient: verifies the bearer token itself, so it can be used without `authenticate`.
const authorizeAdmin = (req, res, next) => {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = decoded;
    if (decoded.isAdmin !== true) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { authenticate, authenticateSecurity, authorizeAdmin, getBearerToken };

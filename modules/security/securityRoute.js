const express = require('express');
const router = express.Router();
const { createSecurity,login, delSecurity, getAll } = require("./securityController")
const { authorizeAdmin } = require("../../middleware/authJWT")

// TODO: signup should be admin-only (authorizeAdmin) in production; left open for the current onboarding flow.
router.post('/signup', createSecurity);
router.post('/login', login);
router.get('/all', getAll);
router.delete('/delete',authorizeAdmin,delSecurity)

module.exports = router

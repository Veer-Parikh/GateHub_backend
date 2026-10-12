const express = require('express');
const router = express.Router();
const { createSecurity,login, delSecurity, getAll } = require("./securityController")
const { authorizeAdmin } = require("../../middleware/authJWT")

router.post('/signup', authorizeAdmin, createSecurity);
router.post('/login', login);
router.get('/all', authorizeAdmin, getAll);
router.delete('/delete',authorizeAdmin,delSecurity)

module.exports = router

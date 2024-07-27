const express = require('express');
const router = express.Router();
const { createSecurity,login } = require("./securityController")
const prisma = require("../../utils/prisma")

router.post('/signup', createSecurity);
router.post('/login', login);

module.exports = router
const express = require('express');
const router = express.Router();
const { createSecurity,login, delSecurity, getAll } = require("./securityController")
const prisma = require("../../utils/prisma")

router.post('/signup', createSecurity);
router.post('/login', login);
router.get('/all', getAll);
router.delete('/delete',delSecurity)

module.exports = router
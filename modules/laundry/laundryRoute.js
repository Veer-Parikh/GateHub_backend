const express = require('express');
const router = express.Router();
const { createLaundry,delLaundry,getLaundrys,login } = require("./laundryController")
const prisma = require("../../utils/prisma")

router.post('/signup', createLaundry);
router.post('/login', login);
router.delete('/delete/:id',delLaundry)
router.get('/get',getLaundrys)

module.exports = router
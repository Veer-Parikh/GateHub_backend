const express = require('express');
const router = express.Router();
const { createPlumber,delPlumber,getPlumbers,login } = require("./plumberController")
const prisma = require("../../utils/prisma")

router.post('/signup', createPlumber);
router.post('/login', login);
router.delete('/delete/:id',delPlumber)
router.get('/get',getPlumbers)

module.exports = router
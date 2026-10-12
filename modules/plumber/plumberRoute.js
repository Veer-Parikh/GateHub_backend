const express = require('express');
const router = express.Router();
const { createPlumber,delPlumber,getPlumbers,login } = require("./plumberController")
const { authorizeAdmin } = require("../../middleware/authJWT")

router.post('/signup', authorizeAdmin, createPlumber);
router.post('/login', login);
router.delete('/delete/:id',authorizeAdmin,delPlumber)
router.get('/get',authorizeAdmin,getPlumbers)

module.exports = router

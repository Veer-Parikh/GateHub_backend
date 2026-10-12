const express = require('express');
const router = express.Router();
const { createLaundry,delLaundry,getLaundrys,login } = require("./laundryController")
const { authorizeAdmin } = require("../../middleware/authJWT")

router.post('/signup', authorizeAdmin, createLaundry);
router.post('/login', login);
router.delete('/delete/:id',authorizeAdmin,delLaundry)
router.get('/get',authorizeAdmin,getLaundrys)

module.exports = router

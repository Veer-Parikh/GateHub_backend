const express = require('express');
const router = express.Router();
const { createLaundry,delLaundry,getLaundrys,login } = require("./laundryController")
const { authorizeAdmin } = require("../../middleware/authJWT")

// TODO: signup should be admin-only (authorizeAdmin) in production; left open for the current onboarding flow.
router.post('/signup', createLaundry);
router.post('/login', login);
router.delete('/delete/:id',authorizeAdmin,delLaundry)
router.get('/get',getLaundrys)

module.exports = router

const express = require('express');
const router = express.Router();
const { createPlumber,delPlumber,getPlumbers,login } = require("./plumberController")
const { authorizeAdmin } = require("../../middleware/authJWT")

// TODO: signup should be admin-only (authorizeAdmin) in production; left open for the current onboarding flow.
router.post('/signup', createPlumber);
router.post('/login', login);
router.delete('/delete/:id',authorizeAdmin,delPlumber)
router.get('/get',getPlumbers)

module.exports = router

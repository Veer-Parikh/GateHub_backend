const express = require('express');
const router = express.Router();
const { deleteUser,allUsers,createUser,myProfile,loginUser,verify } = require("./userController")
const prisma = require("../../utils/prisma")
const uploadMiddleware = require("../../middleware/multer")
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post('/signup', uploadMiddleware.single('image'), createUser);
router.post('/login', loginUser);
router.post('/verify-otp', verify);
router.get('/my/:id', myProfile);
router.get('/all', allUsers);
router.delete('/delete/:id', deleteUser);

module.exports = router
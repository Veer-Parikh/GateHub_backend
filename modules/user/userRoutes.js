const express = require('express');
const router = express.Router();
const { deleteUser,allUsers,createUser,myProfile,requestOtpForLogin,login,verifyLogin } = require("./userController")
const prisma = require("../../utils/prisma")
const uploadMiddleware = require("../../middleware/multer")

router.post('/signup', uploadMiddleware.single('image'), createUser);
router.post('/login', login);
router.post('/request-otp', requestOtpForLogin);
router.post('/verify-otp', verifyLogin);

router.get('/my', myProfile);
router.get('/all', allUsers);
router.delete('/delete', deleteUser);

module.exports = router
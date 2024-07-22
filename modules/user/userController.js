const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const {sendOtp,requestOtp,verifyOtp} = require("../../middleware/twilio")

async function createUser(req, res) {
    try {
        let profileUrl = null;

        if (req.file) {
            const result = cloudinary.uploader.upload(req.file.path);
            profileUrl = (await result).secure_url;
        }

        const { name, email, number, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                profileUrl,
                number,
            },
        });
        logger.info("User saved successfully");
        res.send(user);
    } catch (error) {
        logger.error("Error creating user");
        res.send(error.message);
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.send({ token, userId: user.userId });
    } catch (error) {
        logger.error("Error logging in");
        res.send(error.message);
    }
}

async function requestOtpForLogin(req, res) {
    try {
        await requestOtp(req, res);
    } catch (error) {
        logger.error("Error requesting OTP");
        res.send(error.message);
    }
}

async function verifyLogin(req, res) {
    try {
        const { phoneNumber, otp } = req.body;
        const isValid = await verifyOtp(phoneNumber, otp);

        if (!isValid) {
            return res.status(401).send('Invalid OTP');
        }

        const user = await prisma.user.findUnique({
            where: { number: phoneNumber },
        });

        if (!user) {
            return res.status(401).send('User not found');
        }

        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.send({ token, userId: user.userId });
    } catch (error) {
        logger.error("Error verifying OTP");
        res.send(error.message);
    }
}


async function myProfile(req,res){
    try{
        const user = await prisma.user.findFirst({
            where:{
                userId:req.user.userId
            }
        });
        logger.info("user profile found successfully");
        res.send(user);
    } catch (error) {
        res.send(error);
        logger.error(error);
    }
}

async function allUsers(req, res) {
    try {
      const users = await prisma.user.findMany()
      logger.info("Users profile found successfully");
      return res.status(200).json(users);
    } catch (err) {
      logger.error(err);
      res.send("Internal Server Error");
    }
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function deleteUser(req, res) {
    try {
        const user = await prisma.user.delete({
            where: {
                userId:req.user.userId
            }
        });
        if (!user) {
            logger.error("User doesn't exist");
            return res.send("User does not exist");
        }
        if (user) {
            logger.info("User deleted successfully");
            return res.send("User deleted successfully");
        }
    } catch (err) {
      logger.error(err);
      res.status(400).send(err);
    }
}

module.exports = { deleteUser,allUsers,createUser,myProfile,requestOtpForLogin,login,verifyLogin }
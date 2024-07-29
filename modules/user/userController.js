const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const { generateOTP, getOtpExpiration, sendOTP} = require("../../middleware/auth");
const { generateToken } = require('../../utils/jwt');

async function createUser(req, res) {
    try {
        let profileUrl = null;

        if (req.file) {
            const result = cloudinary.uploader.upload(req.file.path);
            profileUrl = (await result).secure_url;
        }

        const { name, email, number, isAdmin } = req.body;
        // const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();
        const otpExpiration = getOtpExpiration();
       
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const user = await prisma.user.create({
            data: { name, email, number, otp, otpExpiration, isAdmin },
        });

        await sendOTP(number, otp);
        logger.info("otp sent")
        // res.send(user);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        logger.error("Error creating user");
        res.send(error);
    }
}

async function loginUser(req,res){
    try{
        const { number } = req.body;

        const otp = generateOTP();
        const otpExpiration = getOtpExpiration();

        const user = await prisma.user.findFirst({ where: { number } });
        if (!user) {
          return res.json({ message: 'User not found' });
        }

        await prisma.user.update({
            where: { number },
            data: { otp, otpExpiration },
        });
        
        await sendOTP(number, otp);
        res.json({ message: 'OTP sent successfully' });
        logger.info("otp sent")
    } catch (error) {
        res.send(error);
        logger.error(error)
    }
} 

// async function login(req, res) {
//     try {
//         const { email, password } = req.body;
//         const user = await prisma.user.findUnique({
//             where: { email },
//         });

//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).send('Invalid credentials');
//         }

//         const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
//             expiresIn: '1h',
//         });

//         res.send({ token, userId: user.userId });
//     } catch (error) {
//         logger.error("Error logging in");
//         res.send(error.message);
//     }
// }

async function verify(req,res){
    const { number, otp } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { number } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.otp !== otp || new Date() > user.otpExpiration) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      await prisma.user.update({
        where: { number },
        data: { otp: null, otpExpiration: null },
      });
  
      const token = generateToken(user);
      res.status(200).json({ message: 'OTP verified successfully', token , user });
    } catch (error) {
        logger.error(error)
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
}

async function myProfile(req,res){
    try{
        const user = await prisma.user.findFirst({
            where:{
                userId:req.params.id
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
        const userId = req.params.id;

        // Delete the meetings created by the user first
        const deleteMeetings = await prisma.meetings.deleteMany({
            where: {
                userId: userId
            }
        });

        // Delete the user
        const user = await prisma.user.delete({
            where: {
                userId: userId
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

module.exports = { deleteUser,allUsers,createUser,myProfile,verify,loginUser }
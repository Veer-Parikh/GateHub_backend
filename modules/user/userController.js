const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const { generateOTP, getOtpExpiration, sendOTP} = require("../../middleware/auth");
const { generateToken } = require('../../utils/jwt');


const createMultipleRooms = async (req, res) => {
  try {
    const { blocks, numberOfFloors, flatsPerFloor } = req.body;

    if (!Array.isArray(blocks) || !numberOfFloors || !flatsPerFloor) {
      return res.status(400).json({ message: 'Invalid input parameters.' });
    }

    const roomsToCreate = [];

    for (const block of blocks) {
      for (let floor = 1; floor <= numberOfFloors; floor++) {
        for (let flat = 1; flat <= flatsPerFloor; flat++) {
          const roomNumber = `${floor}${flat.toString().padStart(2, '0')}`;
          roomsToCreate.push({
            block,
            room: roomNumber,
          });
        }
      }
    }

    const createdRooms = await prisma.room.createMany({
      data: roomsToCreate,
      skipDuplicates: true, // Avoid duplicate inserts
    });

    return res.status(201).json({ message: 'Rooms created successfully.', count: createdRooms.count });
  } catch (error) {
    console.error('Error creating rooms:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

async function getAllRooms(req,res){
    try{
        const rooms = await prisma.room.findMany({
            where:{
                block:req.body.block
            }
        })
        if(!rooms){
            return res.send("No rooms found")
        }
        logger.info("found rooms successfully")
        return res.send(rooms)
    }catch(error){
        logger.error(error);
        return res.send(error);
    }
}

// async function createUser(req, res) {
//     try {
//         let profileUrl = null;

//         if (req.file) {
//             const result = cloudinary.uploader.upload(req.file.path);
//             profileUrl = (await result).secure_url;
//         }

//         const { name, email, number, isAdmin } = req.body;
//         // const hashedPassword = await bcrypt.hash(password, 10);

//         const otp = generateOTP();
//         const otpExpiration = getOtpExpiration();
       
//         const existingUser = await prisma.user.findUnique({ where: { email } });
//         if (existingUser) {
//           return res.status(400).json({ message: 'User already exists' });
//         }

//         const user = await prisma.user.create({
//             data: { name, email, number, otp, otpExpiration, isAdmin },
//         });

//         await sendOTP(number, otp);
//         logger.info("otp sent")
//         // res.send(user);
//         res.json({ message: 'OTP sent successfully' });
//     } catch (error) {
//         logger.error("Error creating user");
//         res.send(error);
//     }
// }

// async function createUser(req, res) {
//     try {
//       let profileUrl = null;
  
//       // Upload profile image to Cloudinary if present
//       if (req.file) {
//         const result = cloudinary.uploader.upload(req.file.path);
//         profileUrl = (await result).secure_url;
//       }
  
//       const { name, email, number, isAdmin, roomId } = req.body;
  
//       // Generate OTP and expiration
//       const otp = generateOTP();
//       const otpExpiration = getOtpExpiration();
  
//       // Check if user already exists
//       const existingUser = await prisma.user.findUnique({ where: { email } });
//       if (existingUser) {
//         return res.status(400).json({ message: 'User already exists' });
//       }
  
//       // Check if roomId is valid (optional)
//       if (roomId) {
//         const room = await prisma.room.findUnique({ where: { roomId } });
//         if (!room) {
//           return res.status(404).json({ message: 'Room not found' });
//         }
//       }
  
//       // Create the user
//       const user = await prisma.user.create({
//         data: {
//           name,
//           email,
//           number,
//           otp,
//           otpExpiration,
//           isAdmin,
//           profileUrl,
//           roomId: roomId || null,
//         },
//       });
  
//       await sendOTP(number, otp);
//       logger.info('OTP sent');
  
//       res.json({ message: 'OTP sent successfully' });
//     } catch (error) {
//       logger.error('Error creating user', error);
//       res.status(500).json({ message: 'Internal server error', error });
//     }
// }

// async function loginUser(req,res){
//     try{
//         const { number } = req.body;

//         const otp = generateOTP();
//         const otpExpiration = getOtpExpiration();

//         const user = await prisma.user.findFirst({ where: { number } });
//         if (!user) {
//           return res.json({ message: 'User not found' });
//         }

//         await prisma.user.update({
//             where: { number },
//             data: { otp, otpExpiration },
//         });
        
//         await sendOTP(number, otp);
//         res.json({ message: 'OTP sent successfully' });
//         logger.info("otp sent")
//     } catch (error) {
//         res.send(error);
//         logger.error(error)
//     }
// } 

// // async function login(req, res) {
// //     try {
// //         const { email, password } = req.body;
// //         const user = await prisma.user.findUnique({
// //             where: { email },
// //         });

// //         if (!user || !(await bcrypt.compare(password, user.password))) {
// //             return res.status(401).send('Invalid credentials');
// //         }

// //         const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
// //             expiresIn: '1h',
// //         });

// //         res.send({ token, userId: user.userId });
// //     } catch (error) {
// //         logger.error("Error logging in");
// //         res.send(error.message);
// //     }
// // }

// async function verify(req,res){
//     const { number, otp } = req.body;

//     try {
//       const user = await prisma.user.findUnique({ where: { number } });
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       if (user.otp !== otp || new Date() > user.otpExpiration) {
//         return res.status(400).json({ message: 'Invalid or expired OTP' });
//       }
  
//       await prisma.user.update({
//         where: { number },
//         data: { otp: null, otpExpiration: null },
//       });
  
//       const token = generateToken(user);
//       res.status(200).json({ message: 'OTP verified successfully', token , user });
//     } catch (error) {
//         logger.error(error)
//       res.status(500).json({ error: 'Failed to verify OTP' });
//     }
// }


async function createUser(req, res) {
    try {
      let profileUrl = null;
  
      if (req.file) {
        const result = cloudinary.uploader.upload(req.file.path);
        profileUrl = (await result).secure_url;
      }
  
      const { name, email, number, password, isAdmin, roomId } = req.body;
  
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      if (roomId) {
        const room = await prisma.room.findUnique({ where: { roomId } });
        if (!room) {
          return res.status(404).json({ message: 'Room not found' });
        }
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await prisma.user.create({
        data: {
          name,
          email,
          number,
          password: hashedPassword,
          isAdmin,
          profileUrl,
          roomId: roomId || null,
        },
      });
  
      res.json({ message: 'User created successfully', userId: user.userId });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Internal server error', error });
    }
}

async function loginUser(req, res) {
    try {
      const { name, password } = req.body;
  
      const user = await prisma.user.findUnique({ where: { name } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const passwordMatch = bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = generateToken(user);
      res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
      logger.error('Error logging in', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  

async function myProfile(req,res){
    try{
        const user = await prisma.user.findFirst({
            where:{
                userId:req.user.userId
            },
            include:{
                room:{
                    include:{
                      Maintenance:{
                        where:{
                            paid:false
                        }
                    }
                  }
                },
                Visitor:true,   
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
        const userId = req.user.userId;

        await prisma.rating.deleteMany({
            where:{
                userId:userId
            }
        });
        await prisma.booking.deleteMany({
            where:{
                userId:userId
            }
        });
        const deleteVisitors = await prisma.visitor.deleteMany({
            where: {
                userId: userId
            }
        });
        const deleteMeetings = await prisma.meetings.deleteMany({
            where: {
                userId: userId
            }
        });
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

module.exports = { deleteUser,allUsers,createUser,myProfile,loginUser,createMultipleRooms,getAllRooms }
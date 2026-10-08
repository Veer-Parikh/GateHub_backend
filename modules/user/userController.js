const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const { generateOTP, getOtpExpiration, sendOTP} = require("../../middleware/auth");
const { generateToken, verifyToken } = require('../../utils/jwt');
const { getBearerToken } = require('../../middleware/authJWT');
const { sanitize } = require('../../utils/sanitize');

const isDemoMode = () => process.env.DEMO_MODE === 'true';

// Built-in demo personas (only honoured when DEMO_MODE=true).
const DEMO_RESIDENT_NAMES = ["arjun", "resident", "admin"];

function buildDemoProfile(tokenUser) {
    return {
      userId: tokenUser?.userId || "demo-resident-01",
      name: "Arjun Mehta",
      email: "arjun.mehta@nexgate.in",
      isAdmin: !!tokenUser?.isAdmin,
      room: {
        room: "302",
        block: "A",
        Maintenance: [
          { maintenanceId: "m1", amount: 2400, paid: false, month: "October", year: "2026" }
        ]
      }
    };
}

// True only when the request carries a valid bearer token for an admin. Missing or
// invalid tokens are simply treated as "not an admin" (used by the open signup route).
function requestIsFromAdmin(req) {
    const token = getBearerToken(req);
    if (!token) return false;
    try {
        return verifyToken(token).isAdmin === true;
    } catch (error) {
        return false;
    }
}


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
        // GET requests from browsers can't carry a body, so prefer ?block=, keep body for old callers.
        const block = req.query.block ?? req.body?.block;
        if (block !== undefined && typeof block !== 'string') {
            return res.status(400).json({ message: 'block must be a single string value' });
        }
        const rooms = await prisma.room.findMany({
            where: block ? { block } : {},
            orderBy: [{ block: 'asc' }, { room: 'asc' }]
        })
        logger.info("found rooms successfully")
        return res.json(rooms)
    }catch(error){
        logger.error(error);
        return res.status(500).json({ message: 'Failed to fetch rooms' });
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
      const { name, email, number, password, roomId } = req.body || {};

      if (!name || !email || !number || !password) {
        return res.status(400).json({ message: 'name, email, number and password are required' });
      }

      // `isAdmin` is only honoured for callers that are already admins (valid admin bearer token).
      // Multipart forms send booleans as strings, hence the "true" check.
      const wantsAdmin = req.body.isAdmin === true || req.body.isAdmin === 'true';
      const isAdmin = wantsAdmin && requestIsFromAdmin(req);

      const existingUser = await prisma.user.findUnique({ where: { email: String(email) } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      if (roomId) {
        const room = await prisma.room.findUnique({ where: { roomId } });
        if (!room) {
          return res.status(404).json({ message: 'Room not found' });
        }
      }

      let profileUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        profileUrl = result.secure_url;
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);

      const user = await prisma.user.create({
        data: {
          name: String(name),
          email: String(email),
          number: String(number),
          password: hashedPassword,
          isAdmin,
          profileUrl,
          roomId: roomId || null,
        },
      });

      res.json({ message: 'User created successfully', userId: user.userId });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const targets = Array.isArray(target) ? target : (typeof target === 'string' ? [target] : []);
        const field = ['name', 'email', 'number'].find((f) => targets.some((t) => t === f || String(t).includes(`_${f}_`)));
        return res.status(400).json({
          message: field
            ? `A user with this ${field} already exists (${field} must be unique)`
            : 'name, email and number must be unique',
        });
      }
      logger.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
}

async function loginUser(req, res) {
    try {
      const { name, password } = req.body || {};
      if (typeof name !== 'string' || !name.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({ message: 'name and password are required' });
      }

      let user = null;
      let dbError = null;
      try {
        user = await prisma.user.findUnique({ where: { name } });
      } catch (dbErr) {
        dbError = dbErr;
        logger.warn("Database unreachable while looking up user");
      }

      // Default demo resident (DEMO_MODE only) if database is offline or unseeded
      if (!user && isDemoMode() && DEMO_RESIDENT_NAMES.includes(name.trim().toLowerCase())) {
        const demoUser = {
          userId: "demo-resident-01",
          name: name,
          email: "arjun.mehta@nexgate.in",
          phone: "9876543210",
          isAdmin: name.trim().toLowerCase() === "admin",
          roomId: "room-302"
        };
        const token = generateToken(demoUser);
        return res.status(200).json({ message: 'Login successful', token, user: demoUser });
      }

      if (dbError) {
        throw dbError;
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Legacy OTP-only accounts have no password hash.
      if (!user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user);
      res.status(200).json({ message: 'Login successful', token, user: sanitize(user) });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


async function myProfile(req,res){
    try{
        if (!req.user?.userId) {
            return res.status(403).json({ message: 'Not a resident account' });
        }
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
        if (!user) {
          if (isDemoMode()) {
            return res.send(buildDemoProfile(req.user));
          }
          return res.status(404).json({ message: 'User not found' });
        }
        logger.info("user profile found successfully");
        return res.send(sanitize(user));
    } catch (error) {
        logger.error(error);
        // Return demo profile if database query fails (DEMO_MODE only)
        if (isDemoMode()) {
          return res.send(buildDemoProfile(req.user));
        }
        return res.status(500).json({ message: 'Failed to fetch profile' });
    }
}

async function allUsers(req, res) {
    try {
      const users = await prisma.user.findMany()
      logger.info("Users profile found successfully");
      return res.status(200).json(sanitize(users));
    } catch (err) {
      logger.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
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
        if (!userId) {
            return res.status(403).json({ message: 'Not a resident account' });
        }

        // One transaction so a failure (e.g. FK on Events) doesn't leave a half-deleted user.
        await prisma.$transaction([
            prisma.rating.deleteMany({
                where:{
                    OR:[ { userId:userId }, { booking:{ userId:userId } } ]
                }
            }),
            prisma.booking.deleteMany({
                where:{
                    userId:userId
                }
            }),
            prisma.visitor.deleteMany({
                where: {
                    userId: userId
                }
            }),
            prisma.meetings.deleteMany({
                where: {
                    userId: userId
                }
            }),
            prisma.notification.deleteMany({
                where: {
                    userUserId: userId
                }
            }),
            prisma.user.delete({
                where: {
                    userId: userId
                }
            }),
        ]);

        logger.info("User deleted successfully");
        return res.send("User deleted successfully");
    } catch (err) {
      if (err.code === 'P2025') {
        logger.error("User doesn't exist");
        return res.status(404).json({ message: 'User does not exist' });
      }
      logger.error(err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
}

module.exports = { deleteUser,allUsers,createUser,myProfile,loginUser,createMultipleRooms,getAllRooms }

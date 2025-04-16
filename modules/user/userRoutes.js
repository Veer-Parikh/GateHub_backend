const express = require('express');
const router = express.Router();
const { deleteUser,allUsers,createUser,myProfile,loginUser,verify, createMultipleRooms, getAllRooms } = require("./userController")
const prisma = require("../../utils/prisma")
const uploadMiddleware = require("../../middleware/multer")
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post('/signup', uploadMiddleware.single('image'), createUser);
router.post('/login', loginUser);
// router.post('/verify-otp', verify);
router.get('/my',authenticate, myProfile);
router.get('/all', allUsers);
router.delete('/delete', authenticate,deleteUser);

router.post('/rooms', createMultipleRooms);
router.get('/rooms',getAllRooms);
router.get('/blocks', async (req, res) => {
    try {
      const blocks = await prisma.room.findMany({
        distinct: ['block'],
        select: {
          block: true,
        },
      });
  
      const blockValues = blocks.map((b) => b.block);
      res.json({ blocks: blockValues });
    } catch (error) {
      console.error('Error fetching blocks:', error);
      res.status(500).json({ message: 'Failed to fetch blocks' });
    }
  });

module.exports = router
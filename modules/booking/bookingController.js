const prisma = require("../../utils/prisma");
const logger = require("../../utils/logger");

async function createBooking (req,res) {
//     try {
//         const { date,description,plumberId,laundryId } = req.body
//         const userId = req.user.userId
//         const user = await prisma.user.findUnique({
//             where:{
//                 userId:userId
//             },
//             include:{
//                 room:true
//             }
//         })
//         const booking = await prisma.booking.create({
//             data:{
//                 date:date,description:description,userId:req.user.userId,plumberId:plumberId,laundryId:laundryId,roomId:user.room.roomId
//             }
//         }); 
//         res.send(booking);
//         logger.info("booking successful");
//     } catch(error){
//         res.send(error);
//         logger.error(error)
//     }
// }
try {
    const { date, description, plumberId, laundryId } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!date || !description) {
      return res.status(400).json({
        success: false,
        message: "Date and description are required"
      });
    }

    // Get user's roomId
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { roomId: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Validate at least one service is selected
    if (!plumberId && !laundryId) {
      return res.status(400).json({
        success: false,
        message: "Either plumberId or laundryId must be provided"
      });
    }

    const booking = await prisma.booking.create({
      data: {
        date: new Date(date), // Ensure date is properly converted
        description,
        userId,
        plumberId: plumberId || null,
        laundryId: laundryId || null,
        roomId: user.roomId
      },
      include: {
        plumber: true,
        laundry: true,
        user: true,
        room: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message
    });
  }
};

async function deleteBooking (req,res) {
    try {
        await prisma.rating.deleteMany({
            where:{
                bookingId:req.params.id
            }
        })
        await prisma.booking.delete({
            where:{
                bookingId:req.params.id
            }
        })
        logger.info("booking deleted successfully");
        return res.send("booking deleted successfully");
    } catch(error) {
        res.send(error);
        logger.error(error)
    }
}

async function getUserBookings (req,res) {
    try {
        const bookings = await prisma.booking.findMany({
            where:{
                userId:req.user.userId,
                // OR:[
                //     {laundryId:req.params.searchWord},
                //     {plumberId:req.params.searchWord}
                // ]
            },
            include:{
                plumber:true,
                laundry:true,
                Rating:true,
                user:true
            }
        });
        logger.info("user bookings found");
        return res.send(bookings)
    } catch (error) {
        res.send(error);
        logger.error(error)
    }
}

async function getPlumberBookings (req,res) {
    try {
        const bookings = await prisma.booking.findMany({
            where:{
                plumberId:req.user.plumberId
            },
            include:{
                plumber:true,
                Rating:true,
                user:true
            }
        });
        logger.info("plumber bookings found");
        return res.send(bookings)
    } catch (error) {
        res.send(error);
        logger.error(error)
    }
}

async function getLaundryBookings (req,res) {
    try {
        const bookings = await prisma.booking.findMany({
            where:{
                laundryId:req.user.laundryId
            },
            include:{
                laundry:true,
                Rating:true,
                user:true
            }
        });
        logger.info("laundry bookings found");
        return res.send(bookings)
    } catch (error) {
        res.send(error);
        logger.error(error)
    }
}

module.exports = {
    createBooking,deleteBooking,getPlumberBookings,getUserBookings,getLaundryBookings
}
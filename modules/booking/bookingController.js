const prisma = require("../../utils/prisma");
const logger = require("../../utils/logger");
const { sanitize } = require("../../utils/sanitize");

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

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Only residents can create bookings"
      });
    }

    // Validate required fields
    if (!date || !description) {
      return res.status(400).json({
        success: false,
        message: "Date and description are required"
      });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Date is invalid"
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
        date: bookingDate, // Ensure date is properly converted
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
      booking: sanitize(booking)
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking"
    });
  }
};

async function deleteBooking (req,res) {
    try {
        const booking = await prisma.booking.findUnique({
            where:{
                bookingId:req.params.id
            },
            select:{ userId:true }
        })
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const isOwner = Boolean(req.user.userId) && booking.userId === req.user.userId;
        if (!isOwner && req.user.isAdmin !== true) {
            return res.status(403).json({ message: "You can only delete your own bookings" });
        }
        await prisma.$transaction([
            prisma.rating.deleteMany({
                where:{
                    bookingId:req.params.id
                }
            }),
            prisma.booking.delete({
                where:{
                    bookingId:req.params.id
                }
            }),
        ]);
        logger.info("booking deleted successfully");
        return res.send("booking deleted successfully");
    } catch(error) {
        logger.error(error)
        return res.status(500).json({ message: "Failed to delete booking" });
    }
}

async function getUserBookings (req,res) {
    try {
        // An undefined id in a Prisma `where` means "no filter", so never query without one.
        if (!req.user.userId) {
            return res.status(403).json({ message: "Not a resident account" });
        }
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
        return res.send(sanitize(bookings))
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

async function getPlumberBookings (req,res) {
    try {
        if (!req.user.plumberId) {
            return res.status(403).json({ message: "Not a plumber account" });
        }
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
        return res.send(sanitize(bookings))
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

async function getLaundryBookings (req,res) {
    try {
        if (!req.user.laundryId) {
            return res.status(403).json({ message: "Not a laundry account" });
        }
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
        return res.send(sanitize(bookings))
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

module.exports = {
    createBooking,deleteBooking,getPlumberBookings,getUserBookings,getLaundryBookings
}

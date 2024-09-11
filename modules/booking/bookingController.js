const prisma = require("../../utils/prisma");
const logger = require("../../utils/logger");

async function createBooking (req,res) {
    try {
        const { date,description,userId,plumberId,laundryId } = req.body
        const booking = await prisma.booking.create({
            data:{
                date:date,description:description,userId:userId,plumberId:plumberId,laundryId:laundryId
            }
        });
        res.send(booking);
        logger.info("booking successful");
    } catch(error){
        res.send(error);
        logger.error(error)
    }
}

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
                userId:req.params.id,
                OR:[
                    {laundryId:req.params.searchWord},
                    {plumberId:req.params.searchWord}
                ]
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
                plumberId:req.params.id
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
                laundryId:req.params.id
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
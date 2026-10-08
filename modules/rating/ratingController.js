const prisma = require("../../utils/prisma");
const logger = require("../../utils/logger");
const { sanitize } = require("../../utils/sanitize");

async function createRating (req,res) {
    try {
        // The rater is always the authenticated resident, never a client-supplied userId.
        const userId = req.user.userId;
        if (!userId) {
            return res.status(403).json({ message: "Only residents can rate bookings" });
        }
        const { rating,comment,bookingId } = req.body || {};
        if (!bookingId || typeof bookingId !== 'string') {
            return res.status(400).json({ message: "bookingId is required" });
        }
        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: "rating must be a whole number from 1 to 5" });
        }

        const booking = await prisma.booking.findUnique({
            where:{ bookingId },
            select:{ userId:true }
        })
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.userId !== userId) {
            return res.status(403).json({ message: "You can only rate your own bookings" });
        }

        const ratingg = await prisma.rating.create({
            data:{
                userId:userId,bookingId:bookingId,rating:ratingNum,comment:comment
            }
        });
        res.send(ratingg);
        logger.info("rating successful");
    } catch(error){
        logger.error(error)
        res.status(500).json({ message: "Failed to create rating" });
    }
}

async function deleteRating (req,res) {
    try {
        const existing = await prisma.rating.findUnique({
            where:{ ratingId:req.params.id },
            select:{ userId:true }
        })
        if (!existing) {
            return res.status(404).json({ message: "Rating not found" });
        }
        const isOwner = Boolean(req.user.userId) && existing.userId === req.user.userId;
        if (!isOwner && req.user.isAdmin !== true) {
            return res.status(403).json({ message: "You can only delete your own ratings" });
        }
        await prisma.rating.delete({
            where:{
                ratingId:req.params.id
            }
        })
        logger.info("rating deleted successfully");
        return res.send("rating deleted successfully");
    } catch(error) {
        logger.error(error)
        res.status(500).json({ message: "Failed to delete rating" });
    }
}

async function getUserRatings (req,res) {
    try {
        const ratings = await prisma.rating.findMany({
            where:{
                userId:req.params.id
            },
            include:{
                booking:{
                    include:{
                        plumber:true
                    }
                },
                user:true
            }
        });
        logger.info("user ratings found");
        return res.send(sanitize(ratings))
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: "Failed to fetch ratings" });
    }
}

async function getPlumberRatings (req,res) {
    try {
        const ratings = await prisma.rating.findMany({
            where:{
                booking:{
                    plumberId:req.params.id
                },
            },
            include:{
                booking:{
                    include:{
                        plumber:true
                    }
                },
                user:true
            }
        })
        logger.info("booking ratings found");
        return res.send(sanitize(ratings))
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: "Failed to fetch ratings" });
    }
}

module.exports = {
    createRating,deleteRating,getPlumberRatings,getUserRatings
}

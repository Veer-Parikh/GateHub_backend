const prisma = require("../../utils/prisma");
const logger = require("../../utils/logger");

async function createRating (req,res) {
    try {
        const { rating,comment,userId,bookingId } = req.body
        const ratingg = await prisma.rating.create({
            data:{
                userId:userId,bookingId:bookingId,rating:rating,comment:comment
            }
        });
        res.send(ratingg);
        logger.info("rating successful");
    } catch(error){
        res.send(error);
        logger.error(error)
    }
}

async function deleteRating (req,res) {
    try {
        await prisma.rating.delete({
            where:{
                ratingId:req.params.id
            }
        })
        logger.info("rating deleted successfully");
        return res.send("rating deleted successfully");
    } catch(error) {
        res.send(error);
        logger.error(error)
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
        return res.send(ratings)
    } catch (error) {
        res.send(error);
        logger.error(error)
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
        return res.send(ratings)
    } catch (error) {
        res.send(error);
        logger.error(error)
    }
}

module.exports = {
    createRating,deleteRating,getPlumberRatings,getUserRatings
}
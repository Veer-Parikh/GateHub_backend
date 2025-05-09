const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

async function createEvent(req,res){
    try{
        const userId = req.user.userId;
        if (!userId) {
            logger.error("userId not found in request");
            return res.status(400).send("userId not found in request");
        }
        const user = await prisma.user.findUnique({
            where: {
                userId: userId
            }
        });
        if(user.isAdmin === false){
            logger.error("user is not an admin");
            return res.status(403).send("user is not an admin");
        }
        const { title,details,date,venue, } = req.body;
        const event = await prisma.events.create({
            data : {userId,title,details,date,venue}
        });
        logger.info("event created")
        const users = await prisma.user.findMany();

        const formattedTiming = new Date(date).toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short"
        });

        const notifications = users.map(async user => {
            return prisma.notification.create({
                data: {
                    title: `Event Scheduled: ${formattedTiming} - ${venue}`,
                    text: title,
                    userUserId: user.userId
                }
            });
        });

        await Promise.all(notifications);
        logger.info("Notification sent to all users");
        res.send(event)

    } catch(error){
        res.send(error);
        logger.error(error);
    }
}

async function deleteEvent(req,res){
    try {
        const event = await prisma.events.delete({
            where: {
                eventId:req.params.id
            }
        });
        if (!event) {
            logger.error("event doesn't exist");
            return res.send("event does not exist");
        }
        if (event) {
            logger.info("event deleted successfully");
            return res.send("event deleted successfully");
        }
    } catch (err) {
        logger.error(err);
        res.send(err);
    }
}

async function getEvents(req,res) {
    try {
        const events = await prisma.events.findMany({
            include:{
                admin:true
            }
        })
        res.send(events)
    } catch(error){
        logger.error(error);
        res.send(error);        
    }
}

async function getEvent(req,res) {
    try {
        const event = await prisma.events.findFirst({
            where:{
                eventId:req.params.id
            },
            include:{
                admin:true
            }
        })
        res.send(event)
    } catch(error){
        logger.error(error);
        res.send(error);  
    }
}

module.exports = { createEvent,deleteEvent,getEvent,getEvents }
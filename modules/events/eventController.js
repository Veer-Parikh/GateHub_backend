const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');
const { sanitize } = require('../../utils/sanitize');

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
        // Re-check against the DB: the token's isAdmin claim may be stale.
        if(!user || user.isAdmin !== true){
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
        logger.error(error);
        res.status(500).json({ message: 'Failed to create event' });
    }
}

async function deleteEvent(req,res){
    try {
        await prisma.events.delete({
            where: {
                eventId:req.params.id
            }
        });
        logger.info("event deleted successfully");
        return res.send("event deleted successfully");
    } catch (err) {
        if (err.code === 'P2025') {
            logger.error("event doesn't exist");
            return res.status(404).json({ message: 'event does not exist' });
        }
        logger.error(err);
        res.status(500).json({ message: 'Failed to delete event' });
    }
}

async function getEvents(req,res) {
    try {
        const events = await prisma.events.findMany({
            include:{
                admin:true
            }
        })
        res.send(sanitize(events))
    } catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Failed to fetch events' });
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
        if (!event) {
            return res.status(404).json({ message: 'event does not exist' });
        }
        res.send(sanitize(event))
    } catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
}

module.exports = { createEvent,deleteEvent,getEvent,getEvents }

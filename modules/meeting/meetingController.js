const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

async function createMeeting(req, res) {
    try {
        const { userId, title, agenda, timing, location } = req.body;
        
        // Create meeting
        const meeting = await prisma.meetings.create({
            data: { userId, title, agenda, timing, location }
        });
        logger.info("Meeting created");
        
        // Find all users
        const users = await prisma.user.findMany();

        // Convert timing to a more readable format
        const formattedTiming = new Date(timing).toLocaleString("en-IN", {
            dateStyle: "long",
            timeStyle: "short"
        });

        // Send notifications to all users
        const notifications = users.map(async user => {
            return prisma.notification.create({
                data: {
                    title: `Meeting Scheduled: ${formattedTiming} - ${location}`,
                    text: title,
                    userUserId: user.userId
                }
            });
        });

        await Promise.all(notifications);
        logger.info("Notification sent to all users");

        return res.send(meeting);
    } catch (error) {
        res.status(500).send(error);
        logger.error(error);
    }
}

async function getMeetingByMeetingId(req,res) {
    try {
        const {meetingId} = req.body;
        const meeting = await prisma.meetings.findFirst({
            where :{ meetingId }
        })
        res.send(meeting);
        logger.info("meeting found successfully");
    } catch(error) {
        res.send(error);
        logger.error(error);        
    }
}

async function getAllMeetings(req,res) {
    try {
        const meeting = await prisma.meetings.findMany()
        res.send(meeting);
        logger.info("meeting found successfully");
    } catch(error) {
        res.send(error);
        logger.error(error);        
    }
}

async function getMeetingBySearch(req,res) {
    try{
        const searchWord = req.params.searchWord
        const meetings = await prisma.meetings.findMany({
            where:{
                OR:[
                    {
                        title:{
                            contains:searchWord,
                            mode:"insensitive"
                        }
                    },
                    {
                        admin:{
                            name:{
                                contains:searchWord,
                                mode:"insensitive"
                            }
                        },
                    },
                    {
                        agenda:{
                            contains:searchWord,
                            mode:"insensitive"
                        },
                    },
                    {
                        location:{
                            contains:searchWord,
                            mode:"insensitive"
                        },
                    }
                ]
            },
            orderBy:{timing:'desc'},
            include:{admin:true}
        })
        res.send(meetings)
        logger.info("meetings found")
    } catch(error) {
        res.send(error);
        logger.error(error);   
    }
}

async function getCompleteMeeting (req, res) {
    const { meetingId } = req.params;
  
    try {
      const completedMeetings = await prisma.meetings.findMany({
        where: { completed: true },
        include: { admin : true }    
    });
      res.json(completedMeetings);
    } catch (error) {
      res.json({ error: 'An error occurred while updating the meeting status' });
    }
};

async function getIncompleteMeeting (req, res) {
    const { meetingId } = req.params;
  
    try {
      const incompletedMeetings = await prisma.meetings.findMany({
        where: { completed: false },
        include: { admin : true }    
    });
      res.json(incompletedMeetings);
    } catch (error) {
      res.json({ error: 'An error occurred while updating the meeting status' });
    }
};

async function completeMeeting (req, res) {
    const { meetingId } = req.params;
  
    try {
      const updatedMeeting = await prisma.meetings.update({
        where: { meetingId: meetingId },
        data: { completed: true },
      });
      res.json(updatedMeeting);
    } catch (error) {
      res.json({ error: 'An error occurred while updating the meeting status' });
    }
};

async function incompleteMeeting (req, res) {
    const { meetingId } = req.params;
  
    try {
      const updatedMeeting = await prisma.meetings.update({
        where: { meetingId: meetingId },
        data: { completed: false },
      });
      res.json(updatedMeeting);
    } catch (error) {
      res.json({ error: 'An error occurred while updating the meeting status' });
    }
};

async function updateMeeting(req,res) {
    const {userId,title,agenda,timing,location,completed} = req.body
    try {
        const update = await prisma.meetings.update({
            where:{meetingId:req.params.meetingId},
            data:{userId,title,agenda,timing,location,completed}
        });
        res.send(update)
    } catch (error) {
        res.send(error);
        logger.error(error);  
    }
}

async function deleteMeeting(req, res) {
    try {
        const meeting = await prisma.meetings.delete({
            where: {
                meetingId:req.params.id
            }
        });
        if (!meeting) {
            logger.error("meeting doesn't exist");
            return res.send("meeting does not exist");
        }
        if (meeting) {
            logger.info("meeting deleted successfully");
            return res.send("meeting deleted successfully");
        }
    } catch (err) {
        logger.error(err);
        res.send(err);
    }
}

module.exports = { createMeeting,getAllMeetings,getMeetingByMeetingId,getMeetingBySearch,completeMeeting,updateMeeting,deleteMeeting,incompleteMeeting,getCompleteMeeting,getIncompleteMeeting }
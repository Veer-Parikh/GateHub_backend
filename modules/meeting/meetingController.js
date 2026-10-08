const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sanitize } = require('../../utils/sanitize');


// async function createMeeting(req, res) {
//     try {
//         const { userId, title, agenda, timing, location } = req.body;
        
//         // Create meeting
//         const meeting = await prisma.meetings.create({
//             data: { userId, title, agenda, timing, location }
//         });
//         logger.info("Meeting created");
        
//         // Find all users
//         const users = await prisma.user.findMany();

//         // Convert timing to a more readable format
//         const formattedTiming = new Date(timing).toLocaleString("en-IN", {
//             dateStyle: "long",
//             timeStyle: "short"
//         });

//         // Send notifications to all users
//         const notifications = users.map(async user => {
//             return prisma.notification.create({
//                 data: {
//                     title: `Meeting Scheduled: ${formattedTiming} - ${location}`,
//                     text: title,
//                     userUserId: user.userId
//                 }
//             });
//         });

//         await Promise.all(notifications);
//         logger.info("Notification sent to all users");

//         return res.send(meeting);
//     } catch (error) {
//         res.status(500).send(error);
//         logger.error(error);
//     }
// }

const createMeeting = async (req, res) => {
  try {
    const { title, agenda, timing, location, jitsiLink, jitsiId } = req.body
    const userId = req.user.userId // From auth middleware

    if (!title || !timing || !location || Number.isNaN(new Date(timing).getTime())) {
      return res.status(400).json({ error: 'title, a valid timing and location are required' })
    }

    const meeting = await prisma.meetings.create({
      data: {
        title,
        agenda,
        timing: new Date(timing),
        location,
        jitsiLink,
        jitsiId,
        userId
      }
    })

    res.status(201).json(meeting)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ error: 'Failed to create meeting' })
  }
}

// const getAllMeetings = async (req, res) => {
//   try {
//     const meetings = await prisma.meetings.findMany({
//       orderBy: {
//         timing: 'asc'
//       },
//       include: {
//         user: {
//           select: {
//             name: true,
//             email: true
//           }
//         }
//       }
//     })
//     res.json(meetings)
//   } catch (error) {
//     console.error('Error fetching meetings:', error)
//     res.status(500).json({ error: 'Failed to fetch meetings' })
//   }
// }
  
const getAllMeetings = async (req, res) => {
    try {
      const meetings = await prisma.meetings.findMany({
        orderBy: {
          timing: 'asc'
        },
        include: {
          admin:true
        }
      })
      res.json(sanitize(meetings))
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Failed to fetch meetings' })
    }
}

async function getMeetingByMeetingId(req,res) {
    try {
        const meetingId = req.params.id;
        const meeting = await prisma.meetings.findFirst({
            where :{ meetingId }
        })
        if (!meeting) {
            return res.status(404).json({ message: 'meeting does not exist' });
        }
        res.send(meeting);
        logger.info("meeting found successfully");
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Failed to fetch meeting' });
    }
}

// async function getAllMeetings(req,res) {
//     try {
//         const meeting = await prisma.meetings.findMany()
//         res.send(meeting);
//         logger.info("meeting found successfully");
//     } catch(error) {
//         res.send(error);
//         logger.error(error);        
//     }
// }

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
        res.send(sanitize(meetings))
        logger.info("meetings found")
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Failed to search meetings' });
    }
}

async function getCompleteMeeting (req, res) {
    try {
      const completedMeetings = await prisma.meetings.findMany({
        where: { completed: true },
        include: { admin : true }
    });
      res.json(sanitize(completedMeetings));
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'An error occurred while fetching completed meetings' });
    }
};

async function getIncompleteMeeting (req, res) {
    try {
      const incompletedMeetings = await prisma.meetings.findMany({
        where: { completed: false },
        include: { admin : true }
    });
      res.json(sanitize(incompletedMeetings));
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'An error occurred while fetching incomplete meetings' });
    }
};

async function setMeetingCompleted (req, res, completed) {
    const { meetingId } = req.params;

    try {
      const updatedMeeting = await prisma.meetings.update({
        where: { meetingId: meetingId },
        data: { completed },
      });
      res.json(updatedMeeting);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'meeting does not exist' });
      }
      logger.error(error);
      res.status(500).json({ error: 'An error occurred while updating the meeting status' });
    }
}

async function completeMeeting (req, res) {
    return setMeetingCompleted(req, res, true);
};

async function incompleteMeeting (req, res) {
    return setMeetingCompleted(req, res, false);
};

async function updateMeeting(req,res) {
    const {userId,title,agenda,timing,location,completed} = req.body
    try {
        const update = await prisma.meetings.update({
            where:{meetingId:req.params.meetingId},
            data:{userId,title,agenda,timing: timing ? new Date(timing) : undefined,location,completed}
        });
        res.send(update)
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'meeting does not exist' });
        }
        logger.error(error);
        res.status(500).json({ message: 'Failed to update meeting' });
    }
}

async function deleteMeeting(req, res) {
    try {
        await prisma.meetings.delete({
            where: {
                meetingId:req.params.id
            }
        });
        logger.info("meeting deleted successfully");
        return res.send("meeting deleted successfully");
    } catch (err) {
        if (err.code === 'P2025') {
            logger.error("meeting doesn't exist");
            return res.status(404).json({ message: 'meeting does not exist' });
        }
        logger.error(err);
        res.status(500).json({ message: 'Failed to delete meeting' });
    }
}

module.exports = { createMeeting,getAllMeetings,getMeetingByMeetingId,getMeetingBySearch,completeMeeting,updateMeeting,deleteMeeting,incompleteMeeting,getCompleteMeeting,getIncompleteMeeting }

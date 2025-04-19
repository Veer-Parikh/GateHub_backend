const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

// async function sendMaintenance(req,res) {
//     try {
//         const rooms = await prisma.room.findMany({
//             include:{
//                 users:true
//             }
//         });
//         const currentMonth = new Date().toLocaleString('default', { month: 'long' });
//         const currentYear = new Date().getFullYear();

//         const maintenancePromises = rooms.map(async room => {
//             return prisma.maintenance.create({
//                 data: {
//                     amount: req.body.amount,  // Set the initial amount for the maintenance bill
//                     month: currentMonth,
//                     year: currentYear.toString(),
//                     paid: false,
//                     roomId: room.roomId
//                 }
//             });
//         })
//         await Promise.all(maintenancePromises);
//         logger.info('Maintenance bills created/updated for all rooms');

//         const notifications = rooms.map(async room => {
//             return prisma.notification.create({
//                 data : {
//                     title: `Maintenance : ${currentMonth},${currentYear}`,
//                     text: "Check out your pending maintenance for this month now!!",
//                     userUserId: room.users[0].userId,
//                 }
//             })
//         })
//         await Promise.all(notifications)
//         logger.info("Notification Sent to all users")
//         return res.send("maintenance and notification created")
//     } catch(error){
//         res.send(error);
//         logger.error(error);
//     }
// }

async function sendMaintenance(req, res) {
    try {
        const { amount, month, year } = req.body;

        if (!amount || !month || !year) {
            return res.status(400).json({ error: "amount, month, and year are required in the request body" });
        }

        const rooms = await prisma.room.findMany({
            include: {
                users: true
            }
        });

        const maintenancePromises = rooms.map(async (room) => {
            const existing = await prisma.maintenance.findFirst({
                where: {
                    roomId: room.roomId,
                    month: month,
                    year: year
                }
            });

            if (!existing) {
                await prisma.maintenance.create({
                    data: {
                        amount,
                        month,
                        year,
                        paid: false,
                        roomId: room.roomId
                    }
                });

                // Create notification only if maintenance was newly created
                if (room.users.length > 0) {
                    await prisma.notification.create({
                        data: {
                            title: `Maintenance : ${month}, ${year}`,
                            text: "Check out your pending maintenance for this month now!!",
                            userUserId: room.users[0].userId
                        }
                    });
                }

                return { roomId: room.roomId, status: 'created' };
            } else {
                return { roomId: room.roomId, status: 'already_exists' };
            }
        });

        const results = await Promise.all(maintenancePromises);
        logger.info('Maintenance bills processed for all rooms');

        return res.json({
            message: "Maintenance processing complete",
            results
        });

    } catch (error) {
        logger.error(error);
        return res.status(500).json({ error: error.message });
    }
}

async function paid (req,res) {
    try{
        const maintenance = await prisma.maintenance.update({
            where:{
                maintenanceId:req.body.maintenanceId
            },
            data:{
                paid:true
            }
        })
        res.send(maintenance)
        logger.info("maintenance updated to paid")
    } catch(error) {
        res.send(error);
        logger.error(error);
    }
}

async function getAllUnpaid (req,res) {
    try{
        const unpaid = await prisma.maintenance.findMany({
            where:{
                paid:false
            },
            include:{
                room:{
                    include:{
                        users:true
                    }
                }
            }
        })
        logger.info("all unpaid found")
        res.send(unpaid)
    }catch(error){
        res.send(error);
        logger.error(error);
    }
}

async function getUserUnpaid (req,res) {
    try{
        const userId = req.user.userId;
        const room = await prisma.room.findFirst({
            where:{
                users:{
                    some:{
                        userId:userId
                    }
                }
            }
        })
        const unpaid = await prisma.maintenance.findMany({
            where:{
                paid:false,
                roomId:room.roomId
            },
            include:{
                room:{
                    include:{
                        users:true
                    }
                }
            }
        })
        res.send(unpaid)
        logger.info("all user unpaid found")
    }catch(error){
        res.send(error);
        logger.error(error);
    }
}

async function getUserPaid (req,res) {
    try{
        const userId = req.user.userId;
        const room = await prisma.room.findFirst({
            where:{
                users:{
                    some:{
                        userId:userId
                    }
                }
            }
        })
        const unpaid = await prisma.maintenance.findMany({
            where:{
                paid:true,
                roomId:room.roomId
            },
            include:{
                room:{
                    include:{
                        users:true
                    }
                }
            }
        })
        res.send(unpaid)
        logger.info("all user unpaid found")
    }catch(error){
        res.send(error);
        logger.error(error);
    }
}

module.exports = {sendMaintenance,getAllUnpaid,getUserUnpaid,getUserPaid,paid}
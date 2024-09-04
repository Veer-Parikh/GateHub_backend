const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

async function sendMaintenance(req,res) {
    try {
        const users = await prisma.user.findMany();
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();

        const maintenancePromises = users.map(async user => {
            return prisma.maintenance.create({
                data: {
                    amount: req.body.amount,  // Set the initial amount for the maintenance bill
                    month: currentMonth,
                    year: currentYear.toString(),
                    paid: false,
                    userId: user.userId
                }
            });
        })
        await Promise.all(maintenancePromises);
        logger.info('Maintenance bills created/updated for all users');

        const notifications = users.map(async user => {
            return prisma.notification.create({
                data : {
                    title: `Maintenance : ${currentMonth},${currentYear}`,
                    text: "Check out your pending maintenance for this month now!!",
                    userUserId: user.userId
                }
            })
        })
        await Promise.all(notifications)
        logger.info("Notification Sent to all users")
        return res.send("maintenance and notification created")
    } catch(error){
        res.send(error);
        logger.error(error);
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
                user:true
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
        const unpaid = await prisma.maintenance.findMany({
            where:{
                paid:false,
                userId:req.params.id
            },
            include:{
                user:true
            }
        })
        res.send(unpaid)
        logger.info("all user unpaid found")
    }catch(error){
        res.send(error);
        logger.error(error);
    }
}

module.exports = {sendMaintenance,getAllUnpaid,getUserUnpaid,paid}
const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

async function update(req,res) {
    try{
        const notif = await prisma.notification.update({
            where:{
                notificationId:req.params.notificationId
            },
            data:{
                visited:true
            }
        })
        logger.info("Notification visited")
        return res.send(notif)
    } catch(error){
        res.status(500).send(error);
        logger.error(error);
    }
}

async function deleteNotif(req,res){
    try{
        const notif = await prisma.notification.delete({
            where:{
                notificationId:req.params.notificationId
            }
        })
        logger.info("Notification deleted successfully")
        return res.send("Notification deleted successfully")
    }catch(error){
        res.status(500).send(error);
        logger.error(error);
    }
}

async function getUserNotif(req,res) {
    try{
        const notifs = await prisma.notification.findMany({
            where:{
                userUserId:req.params.id
            }
        })
        logger.info("notification of user found")
        return res.send(notifs)
    }catch(error){
        res.status(500).send(error);
        logger.error(error);
    }
}

module.exports = {deleteNotif,getUserNotif,update}
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
const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');

// Builds the Prisma filter for "notifications that belong to the token holder"
// (residents by userId; plumbers / laundries by their own id). Null if the token has none.
function ownerFilter(tokenUser) {
    if (tokenUser?.userId) return { userUserId: tokenUser.userId };
    if (tokenUser?.plumberId) return { plumberId: tokenUser.plumberId };
    if (tokenUser?.laundryId) return { laundryId: tokenUser.laundryId };
    return null;
}

function canAccess(notif, tokenUser) {
    if (tokenUser?.isAdmin === true) return true;
    return Boolean(
        (tokenUser?.userId && notif.userUserId === tokenUser.userId) ||
        (tokenUser?.plumberId && notif.plumberId === tokenUser.plumberId) ||
        (tokenUser?.laundryId && notif.laundryId === tokenUser.laundryId)
    );
}

async function update(req,res) {
    try{
        const existing = await prisma.notification.findUnique({
            where:{ notificationId:req.params.notificationId }
        })
        if (!existing) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (!canAccess(existing, req.user)) {
            return res.status(403).json({ message: 'Access denied' });
        }
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
        logger.error(error);
        return res.status(500).json({ message: 'Failed to update notification' });
    }
}

async function deleteNotif(req,res){
    try{
        const existing = await prisma.notification.findUnique({
            where:{ notificationId:req.params.notificationId }
        })
        if (!existing) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (!canAccess(existing, req.user)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await prisma.notification.delete({
            where:{
                notificationId:req.params.notificationId
            }
        })
        logger.info("Notification deleted successfully")
        return res.send("Notification deleted successfully")
    }catch(error){
        logger.error(error);
        return res.status(500).json({ message: 'Failed to delete notification' });
    }
}

async function getUserNotif(req,res) {
    try{
        if (!req.user?.userId || req.params.id !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const notifs = await prisma.notification.findMany({
            where:{
                userUserId:req.params.id
            },
            orderBy:{ createdAt:'desc' }
        })
        logger.info("notification of user found")
        return res.send(notifs)
    }catch(error){
        logger.error(error);
        return res.status(500).json({ message: 'Failed to fetch notifications' });
    }
}

async function getMyNotifs(req,res) {
    try{
        const where = ownerFilter(req.user);
        if (!where) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const notifs = await prisma.notification.findMany({
            where,
            orderBy:{ createdAt:'desc' }
        })
        return res.json(notifs)
    }catch(error){
        logger.error(error);
        return res.status(500).json({ message: 'Failed to fetch notifications' });
    }
}

module.exports = {deleteNotif,getUserNotif,update,getMyNotifs}

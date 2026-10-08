const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');
const { sanitize } = require('../../utils/sanitize');

const MAX_INT32 = 2147483647;

// Room of the resident behind the token (null if none / not a resident token).
// Guarding on userId matters: an undefined id in a Prisma `where` means "no filter".
async function findUserRoom(userId) {
    if (!userId) return null;
    return prisma.room.findFirst({
        where:{
            users:{
                some:{
                    userId:userId
                }
            }
        }
    })
}

// Loads req.body.visitorId and checks the caller may act on it: admins and security staff
// may act on any visitor, residents only on visitors for their own flat.
// Sends the error response itself and returns null when not allowed.
async function loadVisitorForAction(req, res) {
    const visitorId = req.body?.visitorId;
    if (!visitorId || typeof visitorId !== 'string') {
        res.status(400).json({ message: 'visitorId is required' });
        return null;
    }
    const visitor = await prisma.visitor.findUnique({
        where:{ visitorId },
        include:{ room:{ select:{ users:{ select:{ userId:true } } } } }
    })
    if (!visitor) {
        res.status(404).json({ message: 'Visitor not found' });
        return null;
    }
    const me = req.user || {};
    const allowed = me.isAdmin === true ||
        Boolean(me.securityId) ||
        Boolean(me.userId && (visitor.userId === me.userId || visitor.room?.users.some((u) => u.userId === me.userId)));
    if (!allowed) {
        res.status(403).json({ message: 'Access denied' });
        return null;
    }
    return visitor;
}

async function createVisitor(req,res) {
    try{
        const {name,age,address,purpose,number,photo,block,flat} = req.body || {};
        const securityId = req.security.securityId;

        if (!name || !address || !purpose || !block || !flat ||
            age === undefined || age === null || age === '' ||
            number === undefined || number === null || String(number).trim() === '') {
            return res.status(400).json({ message: 'name, age, address, purpose, number, block and flat are required' });
        }

        const ageNum = Number(age);
        if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 150) {
            return res.status(400).json({ message: 'age must be a whole number' });
        }

        // TODO: Visitor.number is an INT column, so 10-digit Indian phone numbers overflow it.
        // Migrate the column to String (prisma migration) and drop this range check.
        const phone = Number(number);
        if (!Number.isInteger(phone) || phone < 0 || phone > MAX_INT32) {
            return res.status(400).json({
                message: `number must be a whole number between 0 and ${MAX_INT32}; 10-digit phone numbers are not supported yet (the Visitor.number column is a 32-bit integer)`
            });
        }

        const room = await prisma.room.findFirst({
            where:{
                block: String(block),
                room: String(flat)
            },
            include:{
                users:{ select:{ userId:true } }
            }
        })
        if(!room){
            return res.status(400).send("Room not found")
        }

        const visitor = await prisma.visitor.create({
            data : {
                name,
                age: ageNum,
                address,
                purpose,
                number: phone,
                photo,
                securityId,
                roomId: room.roomId,
                // A flat may have no registered residents yet.
                userId: room.users[0]?.userId ?? null
            },
        })
        res.send(visitor)
        logger.info("visitor created successfully")
    }catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Failed to create visitor' });
    }
}

async function inside(req,res){
    try {
        const existing = await loadVisitorForAction(req, res);
        if (!existing) return;
        const visitor = await prisma.visitor.update({
            data:{
                status:true,
                hasLeft:false
            },
            where:{
                visitorId:existing.visitorId
            }
        })
        res.send(visitor);
        logger.info("visitor inside")
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Error admitting the visitor' });
    }
}

async function delVisitor(req,res){
    try {
        const existing = await loadVisitorForAction(req, res);
        if (!existing) return;
        const visitor = await prisma.visitor.delete({
            where:{
                visitorId:existing.visitorId
            }
        })
        res.send(visitor);
        logger.info("Visitor deleted")
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Error deleting the visitor' });
    }
}

async function getWaiting(req,res) {
    try {
        if (!req.user.userId) {
            return res.status(403).json({ message: 'Not a resident account' });
        }
        const room = await findUserRoom(req.user.userId);
        if (!room) {
            return res.send([]);
        }
        const visitors = await prisma.visitor.findMany({
            where:{
                status:false,
                roomId:room.roomId,
                hasLeft:false
            },
            include:{
                security:true
            }
        })
        res.send(sanitize(visitors))
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Error fetching the visitors' });
    }
}

async function prevVisitorsInUser(req,res) {
    try {
        if (!req.user.userId) {
            return res.status(403).json({ message: 'Not a resident account' });
        }
        const room = await findUserRoom(req.user.userId);
        if (!room) {
            return res.send([]);
        }
        const visitors = await prisma.visitor.findMany({
            where:{
                roomId:room.roomId,
                hasLeft:true,
            },
            include:{
                security:true
            }
        })
        res.send(sanitize(visitors))

    }catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Error fetching the visitors' });
    }
}

async function hasLeft(req,res) {
    try{
        const existing = await loadVisitorForAction(req, res);
        if (!existing) return;
        const visitorr = await prisma.visitor.update({
            where:{
                visitorId:existing.visitorId
            },
            data:{
                hasLeft:true,
                status:false
            }
        })
        res.send(visitorr);
    }catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Error updating the visitor' });
    }
}

async function getInside(req,res) {
    try {
        if (!req.user.userId) {
            return res.status(403).json({ message: 'Not a resident account' });
        }
        const room = await findUserRoom(req.user.userId);
        if (!room) {
            return res.send([]);
        }
        const visitors = await prisma.visitor.findMany({
            where:{
                status:true,
                roomId:room.roomId,
            },
            include:{
                security:true
            }
        })
        res.send(sanitize(visitors))
    } catch(error) {
        logger.error(error)
        res.status(500).json({ message: 'Error fetching the visitors' });
    }
}

async function getNotified(req,res) {
    try {
        const visitors = await prisma.visitor.findMany({
            where:{
                status:false,
                securityId:null
            }
        })
        res.send(visitors)
    } catch(error) {
        // Previously an empty catch, which left the request hanging forever.
        logger.error(error);
        res.status(500).json({ message: 'Error fetching the visitors' });
    }
}

module.exports = { createVisitor,delVisitor,getWaiting,getInside,getNotified,inside,prevVisitorsInUser,hasLeft }

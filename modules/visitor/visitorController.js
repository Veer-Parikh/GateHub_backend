const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const logger = require('../../utils/logger');

async function createVisitor(req,res) {
    try{
        const {name,age,address,purpose,number,photo,block,flat} = req.body 
        const securityId = req.security.securityId;
        console.log(securityId)

        const room = await prisma.room.findFirst({
            where:{
                block: block,
                room: flat
            },
            include:{
                users:true
            }
        })
        console.log(room)
        if(!room){
            return res.status(400).send("Room not found")
        }

        const visitor = await prisma.visitor.create({
            data : {name,age,address,purpose,number,photo,securityId,roomId:room.roomId,userId:room.users[0].userId},
        })
        res.send(visitor)
        logger.info("visitor created successfully")
    }catch(error){
        logger.error(error);
        res.send(error);
    }
}

async function inside(req,res){
    try {
        const visitor = await prisma.visitor.update({
            data:{
                status:true,
                hasLeft:false
            },
            where:{
                visitorId:req.body.visitorId
            }
        })
        res.send(visitor);
        logger.info("visitor inside")
    } catch(error) {
        logger.error("Error admiting the visitor");
        res.send(error);
    }
}

async function delVisitor(req,res){
    try {
        const visitor = await prisma.visitor.delete({
            where:{
                visitorId:req.body.visitorId
            }
        })
        res.send(visitor);
        logger.info("Visitor deleted")
    } catch (error) {
        logger.error("Error deleting the visitor");
        res.send(error);
    }
}

async function getWaiting(req,res) {
    try {
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
        res.send(visitors)
    } catch(error) {
        logger.error("Error fetching the visitor");
        res.send(error);
    }
}

async function prevVisitorsInUser(req,res) {
    try {
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
        const visitors = await prisma.visitor.findMany({
            where:{
                roomId:room.roomId,
                hasLeft:true,
            },
            include:{
                security:true
            }
        })
        res.send(visitors)

    }catch(error) {
        logger.error(error);
        res.send(error);
    }
}

async function hasLeft(req,res) {
    try{
        const visitor = req.body.visitorId;
        const visitorr = await prisma.visitor.update({
            where:{
                visitorId:visitor
            },
            data:{
                hasLeft:true,
                status:false
            }
        })
        res.send(visitorr);
    }catch(error){
        logger.error("Error fetching the visitor");
        res.send(error);
    }
}

async function getInside(req,res) {
    try {
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
        const visitors = await prisma.visitor.findMany({
            where:{
                status:true,
                roomId:room.roomId,
            },
            include:{
                security:true
            }
        })
        res.send(visitors)
    } catch(error) {
        res.send(error)
        logger.error(error)
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

    }
}

module.exports = { createVisitor,delVisitor,getWaiting,getInside,getNotified,inside,prevVisitorsInUser,hasLeft }
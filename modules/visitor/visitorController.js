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
                status:true
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
        const visitors = await prisma.visitor.findMany({
            where:{
                status:false,
                userId:null
            }
        })
        res.send(visitors)
    } catch(error) {

    }
}

async function getInside(req,res) {
    try {
        const visitors = await prisma.visitor.findMany({
            where:{
                status:true
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

module.exports = { createVisitor,delVisitor,getWaiting,getInside,getNotified,inside }
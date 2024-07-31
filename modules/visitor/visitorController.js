const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const logger = require('../../utils/logger');

async function createVisitor(req,res) {
    try{
        const {name,age,address,purpose,number,photo,userId,securityId} = req.body 
        
        const visitor = await prisma.visitor.create({
            data : {name,age,address,purpose,number,photo,userId,securityId,status:false}
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
const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const { generateOTP, getOtpExpiration, sendOTP} = require("../../middleware/auth");
const { generateToken } = require('../../utils/jwt');

async function createSecurity (req,res) {
    try {
        const { name,number,password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingSecurity = await prisma.security.findUnique({ where: { number } });
        if (existingSecurity) {
          return res.status(400).json({ message: 'Security already exists' });
        }        
        const security = await prisma.security.create({
            data:{ name:name,number:number,password:hashedPassword }
        });
        res.send(security);
        logger.info("Security created successfully");
    } catch(error) {
        logger.error(error);
        res.send(error);
    }
}

async function login(req, res) {
    try {
        const { name, password } = req.body;
        const security = await prisma.security.findFirst({
            where: { name },
        });

        if (!security || !(await bcrypt.compare(password, security.password))) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ securityId: security.securityId }, process.env.JWT_SECRET);
        res.send({token,security});
    } catch (error) {
        logger.error(error);
        res.send(error);
    }
}

async function getAll(req,res){
    try{
        const security = await prisma.security.findMany();
        res.send(security);
        logger.info("security fetched successfully")
    } catch(error){
        res.error(error);
        logger.error(error);
    }
}

async function delSecurity (req,res) {
    try {
        const deleteVisitors = await prisma.visitor.deleteMany({
            where: {
                securityId: req.body.securityId
            }
        });
        const security = await prisma.security.delete({
            where:{
                securityId:req.body.securityId
            }
        });
        res.send("security deleted successfully")
        logger.info("security deleted successfully")
    } catch (error) {
        res.send(error);
        logger.error(error);
    }
}//active or not

module.exports = { createSecurity,login,delSecurity,getAll }
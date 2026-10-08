const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const cloudinary = require('cloudinary').v2;
const logger = require('../../utils/logger');
const { generateOTP, getOtpExpiration, sendOTP} = require("../../middleware/auth");
const { signToken } = require('../../utils/jwt');
const { sanitize } = require('../../utils/sanitize');

// Built-in demo guard personas (only honoured when DEMO_MODE=true).
const DEMO_SECURITY_NAMES = ["guard", "vikram", "security"];

async function createSecurity (req,res) {
    try {
        const { name,number,password } = req.body || {};
        if (!name || !number || !password) {
            return res.status(400).json({ message: 'name, number and password are required' });
        }

        const existingSecurity = await prisma.security.findUnique({ where: { number: String(number) } });
        if (existingSecurity) {
          return res.status(400).json({ message: 'Security already exists' });
        }
        const hashedPassword = await bcrypt.hash(String(password), 10);
        const security = await prisma.security.create({
            data:{ name:String(name),number:String(number),password:hashedPassword }
        });
        res.send(sanitize(security));
        logger.info("Security created successfully");
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Failed to create security' });
    }
}

async function login(req, res) {
    try {
        const { name, password } = req.body || {};
        if (typeof name !== 'string' || !name.trim() || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'name and password are required' });
        }

        let security = null;
        let dbError = null;
        try {
          security = await prisma.security.findFirst({ where: { name } });
        } catch (dbErr) {
          dbError = dbErr;
          logger.warn("Database unreachable while looking up security");
        }

        // Default demo guard (DEMO_MODE only)
        if (!security && process.env.DEMO_MODE === 'true' && DEMO_SECURITY_NAMES.includes(name.trim().toLowerCase())) {
          const demoSecurity = {
            securityId: "demo-guard-01",
            name: name,
            number: "9876543200"
          };
          const token = signToken({ securityId: demoSecurity.securityId });
          return res.status(200).send({ token, security: demoSecurity });
        }

        if (dbError) {
            throw dbError;
        }

        if (!security || !(await bcrypt.compare(password, security.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = signToken({ securityId: security.securityId });
        res.send({token,security:sanitize(security)});
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getAll(req,res){
    try{
        const security = await prisma.security.findMany();
        res.send(sanitize(security));
        logger.info("security fetched successfully")
    } catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Failed to fetch security' });
    }
}

async function delSecurity (req,res) {
    try {
        const securityId = req.body?.securityId;
        // Without this guard, `deleteMany({ where: { securityId: undefined } })` would delete every visitor.
        if (!securityId || typeof securityId !== 'string') {
            return res.status(400).json({ message: 'securityId is required' });
        }
        await prisma.$transaction([
            prisma.visitor.deleteMany({
                where: {
                    securityId: securityId
                }
            }),
            prisma.security.delete({
                where:{
                    securityId:securityId
                }
            }),
        ]);
        res.send("security deleted successfully")
        logger.info("security deleted successfully")
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Security not found' });
        }
        logger.error(error);
        res.status(500).json({ message: 'Failed to delete security' });
    }
}//active or not

module.exports = { createSecurity,login,delSecurity,getAll }

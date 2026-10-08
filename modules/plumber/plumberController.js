const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');
const bcrypt = require('bcrypt');
const { signToken } = require('../../utils/jwt');
const { sanitize } = require('../../utils/sanitize');

// Built-in demo plumber personas (only honoured when DEMO_MODE=true).
const DEMO_PLUMBER_NAMES = ["plumber", "raju"];

async function createPlumber (req,res) {
    try {
        const { name,password,number,generalCost,serviceHours } = req.body || {};
        if (!name || !password || !number || generalCost === undefined || generalCost === null || generalCost === '' || !serviceHours) {
            return res.status(400).json({ message: 'name, password, number, generalCost and serviceHours are required' });
        }
        const cost = Number(generalCost);
        if (!Number.isFinite(cost) || cost < 0) {
            return res.status(400).json({ message: 'generalCost must be a non-negative number' });
        }

        const existingPlumber = await prisma.plumber.findFirst({ where: { number: String(number) } });
        if (existingPlumber) {
          return res.status(400).json({ message: 'Plumber already exists' });
        }
        const hashedPassword = await bcrypt.hash(String(password), 10);
        const plumber = await prisma.plumber.create({
            data:{ name:String(name),password:hashedPassword,number:String(number),generalCost:cost,serviceHours:String(serviceHours) }
        });
        res.send(sanitize(plumber));
        logger.info("plumber created successfully");
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Failed to create plumber' });
    }
}

async function getPlumbers (req,res) {
    try {
        const plumbers = await prisma.plumber.findMany({
            include:{
                Booking:{
                    include:{
                        plumber:true,
                        Rating:true,
                        user:true
                    }
                }
            }
        })
        res.send(sanitize(plumbers));
        logger.info("plumbers found");
    } catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Failed to fetch plumbers' });
    }
}

async function login(req, res) {
    try {
        const { name, password } = req.body || {};
        if (typeof name !== 'string' || !name.trim() || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'name and password are required' });
        }

        let plumber = null;
        let dbError = null;
        try {
          plumber = await prisma.plumber.findFirst({ where: { name } });
        } catch (dbErr) {
          dbError = dbErr;
          logger.warn("Database unreachable while looking up plumber");
        }

        // Default demo plumber (DEMO_MODE only)
        if (!plumber && process.env.DEMO_MODE === 'true' && DEMO_PLUMBER_NAMES.includes(name.trim().toLowerCase())) {
          const demoPlumber = {
            plumberId: "p1",
            name: name,
            number: "9845001234",
            generalCost: 350,
            serviceHours: "8 AM – 8 PM"
          };
          const token = signToken({ plumberId: demoPlumber.plumberId });
          return res.status(200).send({ token, plumber: demoPlumber });
        }

        if (dbError) {
            throw dbError;
        }

        if (!plumber || !(await bcrypt.compare(password, plumber.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = signToken({ plumberId : plumber.plumberId });
        res.send({token,plumber:sanitize(plumber)});
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function delPlumber (req,res) {
    try {
        const plumberId = req.params.id;
        await prisma.$transaction([
            prisma.rating.deleteMany({
                where:{
                    booking:{
                        plumberId:plumberId
                    }
                }
            }),
            prisma.booking.deleteMany({
                where:{
                    plumberId:plumberId
                }
            }),
            prisma.notification.deleteMany({
                where:{
                    plumberId:plumberId
                }
            }),
            prisma.plumber.delete({
                where:{
                    plumberId:plumberId
                }
            }),
        ]);
        res.send("plumber deleted successfully")
        logger.info("plumber deleted successfully")
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Plumber not found' });
        }
        logger.error(error);
        res.status(500).json({ message: 'Failed to delete plumber' });
    }
}

module.exports = { createPlumber,getPlumbers,delPlumber,login }

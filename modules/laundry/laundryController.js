const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');
const bcrypt = require('bcrypt');
const { signToken } = require('../../utils/jwt');
const { sanitize } = require('../../utils/sanitize');

// Built-in demo laundry personas (only honoured when DEMO_MODE=true).
const DEMO_LAUNDRY_NAMES = ["laundry", "freshpress"];

async function createLaundry (req,res) {
    try {
        const { name,password,number,generalCost,serviceHours } = req.body || {};
        if (!name || !password || !number || generalCost === undefined || generalCost === null || generalCost === '') {
            return res.status(400).json({ message: 'name, password, number and generalCost are required' });
        }
        const cost = Number(generalCost);
        if (!Number.isFinite(cost) || cost < 0) {
            return res.status(400).json({ message: 'generalCost must be a non-negative number' });
        }

        const existingLaundry = await prisma.laundry.findFirst({ where: { number: String(number) } });
        if (existingLaundry) {
          return res.status(400).json({ message: 'Laundry already exists' });
        }
        const hashedPassword = await bcrypt.hash(String(password), 10);
        const laundry = await prisma.laundry.create({
            data:{ name:String(name),password:hashedPassword,number:String(number),generalCost:cost,serviceHours:serviceHours ? String(serviceHours) : null }
        });
        res.send(sanitize(laundry));
        logger.info("laundry created successfully");
    } catch(error) {
        logger.error(error);
        res.status(500).json({ message: 'Failed to create laundry' });
    }
}

async function getLaundrys (req,res) {
    try {
        const laundrys = await prisma.laundry.findMany({
            include:{
                Booking:{
                    include:{
                        laundry:true,
                        Rating:true,
                        user:true
                    }
                }
            }
        })
        res.send(sanitize(laundrys));
        logger.info("laundries found");
    } catch(error){
        logger.error(error);
        res.status(500).json({ message: 'Failed to fetch laundries' });
    }
}

async function login(req, res) {
    try {
        const { name, password } = req.body || {};
        if (typeof name !== 'string' || !name.trim() || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'name and password are required' });
        }

        let laundry = null;
        let dbError = null;
        try {
          laundry = await prisma.laundry.findFirst({ where: { name } });
        } catch (dbErr) {
          dbError = dbErr;
          logger.warn("Database unreachable while looking up laundry");
        }

        // Default demo laundry (DEMO_MODE only)
        if (!laundry && process.env.DEMO_MODE === 'true' && DEMO_LAUNDRY_NAMES.includes(name.trim().toLowerCase())) {
          const demoLaundry = {
            laundryId: "l1",
            name: name,
            number: "9900001234",
            generalCost: 120,
            serviceHours: "7 AM – 9 PM"
          };
          const token = signToken({ laundryId: demoLaundry.laundryId });
          return res.status(200).send({ token, laundry: demoLaundry });
        }

        if (dbError) {
            throw dbError;
        }

        if (!laundry || !(await bcrypt.compare(password, laundry.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = signToken({ laundryId : laundry.laundryId });
        res.send({token,laundry:sanitize(laundry)});
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function delLaundry (req,res) {
    try {
        const laundryId = req.params.id;
        await prisma.$transaction([
            prisma.rating.deleteMany({
                where:{
                    booking:{
                        laundryId:laundryId
                    }
                }
            }),
            prisma.booking.deleteMany({
                where:{
                    laundryId:laundryId
                }
            }),
            prisma.notification.deleteMany({
                where:{
                    laundryId:laundryId
                }
            }),
            prisma.laundry.delete({
                where:{
                    laundryId:laundryId
                }
            }),
        ]);
        res.send("laundry deleted successfully")
        logger.info("laundry deleted successfully")
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Laundry not found' });
        }
        logger.error(error);
        res.status(500).json({ message: 'Failed to delete laundry' });
    }
}

module.exports = { createLaundry,getLaundrys,delLaundry,login }

const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function createPlumber (req,res) {
    try {
        const { name,password,number,generalCost,serviceHours } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingPlumber = await prisma.plumber.findFirst({ where: { number } });
        if (existingPlumber) {
          return res.status(400).json({ message: 'Plumber already exists' });
        }        
        const plumber = await prisma.plumber.create({
            data:{ name:name,password:hashedPassword,number:number,generalCost:generalCost,serviceHours:serviceHours }
        });
        res.send(plumber);
        logger.info("plumber created successfully");
    } catch(error) {
        logger.error(error);
        res.send(error);
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
        res.send(plumbers);
        logger.info("plumbers found");
    } catch(error){
        logger.error(error);
        res.send(error);
    }
}

async function login(req, res) {
    try {
        const { name, password } = req.body;
        const plumber = await prisma.plumber.findFirst({
            where: { name },
        });

        if (!plumber || !(await bcrypt.compare(password, plumber.password))) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ plumberId : plumber.plumberId }, process.env.JWT_SECRET);
        res.send({token,plumber});
    } catch (error) {
        logger.error(error);
        res.send(error);
    }
}

async function delPlumber (req,res) {
    try {
        await prisma.rating.deleteMany({
            where:{
                booking:{
                    plumberId:req.params.id
                }
            }
        })
        await prisma.booking.deleteMany({
            where:{
                plumberId:req.params.id
            }
        })
        const plumber = await prisma.plumber.delete({
            where:{
                plumberId:req.params.id
            }
        });
        res.send("plumber deleted successfully")
        logger.info("plumber deleted successfully")
    } catch (error) {
        res.send(error);
        logger.error(error);
    }
}

module.exports = { createPlumber,getPlumbers,delPlumber,login }
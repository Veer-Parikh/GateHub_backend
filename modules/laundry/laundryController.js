const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function createLaundry (req,res) {
    try {
        const { name,password,number,generalCost,serviceHours } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingLaundry = await prisma.laundry.findFirst({ where: { number } });
        if (existingLaundry) {
          return res.status(400).json({ message: 'Laundry already exists' });
        }        
        const laundry = await prisma.laundry.create({
            data:{ name:name,password:hashedPassword,number:number,generalCost:generalCost,serviceHours:serviceHours }
        });
        res.send(laundry);
        logger.info(" created successfully");
    } catch(error) {
        logger.error(error);
        res.send(error);
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
        res.send(laundrys);
        logger.info("laundries found");
    } catch(error){
        logger.error(error);
        res.send(error);
    }
}

async function login(req, res) {
    try {
        const { name, password } = req.body;
        const laundry = await prisma.laundry.findFirst({
            where: { name },
        });

        if (!laundry || !(await bcrypt.compare(password, laundry.password))) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ laundryId : laundry.laundryId }, process.env.JWT_SECRET);
        res.send({token,laundry});
    } catch (error) {
        logger.error(error);
        res.send(error);
    }
}

async function delLaundry (req,res) {
    try {
        await prisma.rating.deleteMany({
            where:{
                booking:{
                    laundryId:req.params.id
                }
            }
        })
        await prisma.booking.deleteMany({
            where:{
                laundryId:req.params.id
            }
        })
        const laundry = await prisma.laundry.delete({
            where:{
                laundryId:req.params.id
            }
        });
        res.send("laundry deleted successfully")
        logger.info("laundry deleted successfully")
    } catch (error) {
        res.send(error);
        logger.error(error);
    }
}

module.exports = { createLaundry,getLaundrys,delLaundry,login }
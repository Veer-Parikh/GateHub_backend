const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')
const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');
const cron = require('node-cron');

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin:'*'
    })
)

app.use(express.json());
app.use(bodyParser.json());

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

const userRoutes = require('./modules/user/userRoutes')
app.use('/api/user',userRoutes)

const meetingRoutes = require('./modules/meeting/meetingRoute')
app.use('/api/meeting',meetingRoutes)

const securityRoutes = require('./modules/security/securityRoute')
app.use('/api/security',securityRoutes)

const visitorRoutes = require('./modules/visitor/visitorRoute')
app.use('/api/visitor',visitorRoutes)

const eventRoutes = require('./modules/events/eventRoute')
app.use('/api/event',eventRoutes)

cron.schedule('30 18 3 * *', async () => {
    try {
        const users = await prisma.user.findMany();

        const maintenancePromises = users.map(user => {
            return prisma.maintenance.create({
                data: {
                    amount: 100.00,  // Set the amount for the maintenance bill
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    year: new Date().getFullYear(),
                    paid: false,
                    userId: user.userId
                }
            });
        });

        await Promise.all(maintenancePromises);
        logger.info('Maintenance bills created for all users');
    } catch (error) {
        logger.error('Failed to create maintenance bills:', error);
    }
});
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')

// Load .env before anything that reads process.env at require time.
dotenv.config();

const logger = require('./utils/logger');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 5000;

// CORS_ORIGIN: comma-separated list of allowed origins, or '*' (default) for any.
const corsOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: corsOrigins.length === 0 || corsOrigins.includes('*') ? '*' : corsOrigins
    })
)

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
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

const laundryRoutes = require('./modules/laundry/laundryRoute')
app.use('/api/laundry',laundryRoutes)

const plumberRoutes = require('./modules/plumber/plumberRoute')
app.use('/api/plumber',plumberRoutes)

const bookingRoutes = require('./modules/booking/bookingRoute')
app.use('/api/booking',bookingRoutes)

const ratingRoutes = require('./modules/rating/ratingRoute')
app.use('/api/rating',ratingRoutes)

const maintenanceRoutes = require('./modules/maintenance/maintenanceRoute')
app.use('/api/maintenance',maintenanceRoutes)

const notificationRoutes = require("./modules/notification/notificationRoute")
app.use("/api/notification",notificationRoutes)

// JSON 404 for unknown API routes.
app.use('/api', (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Final error handler (malformed JSON bodies, multer errors, anything passed to next(err)).
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let status = 500;
    if (err.status >= 400 && err.status < 500) {
        status = err.status; // e.g. body-parser "entity.parse.failed" -> 400
    } else if (err.name === 'MulterError') {
        status = 400;
    }
    if (status >= 500) {
        logger.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
    logger.warn(`${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);
    return res.status(status).json({ message: err.expose || err.name === 'MulterError' ? err.message : 'Bad request' });
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

// NOTE: the cron job below needs a Prisma client if re-enabled: const prisma = require('./utils/prisma')
// cron.schedule('19 20 3 * *', async () => {
//     try {
//         const users = await prisma.user.findMany();
//         const currentMonth = new Date().toLocaleString('default', { month: 'long' });
//         const currentYear = new Date().getFullYear();

//         const maintenancePromises = users.map(async user => {
//             const existingMaintenance = await prisma.maintenance.findFirst({
//                 where: {
//                     userId: user.userId,
//                     month: currentMonth,
//                     year: currentYear.toString()
//                 }
//             });

//             if (existingMaintenance) {
//                 return prisma.maintenance.update({
//                     where: {
//                         maintenanceId: existingMaintenance.maintenanceId
//                     },
//                     data: {
//                         amount: existingMaintenance.amount + 100.00 // Update the amount as needed
//                     }
//                 });
//             } else {
//                 return prisma.maintenance.create({
//                     data: {
//                         amount: 100.00,  // Set the initial amount for the maintenance bill
//                         month: currentMonth,
//                         year: currentYear.toString(),
//                         paid: false,
//                         userId: user.userId
//                     }
//                 });
//             }
//         });

//         await Promise.all(maintenancePromises);
//         logger.info('Maintenance bills created/updated for all users');
//     } catch (error) {
//         logger.error( error);
//     }
// });


// const task = () => {
//     logger.info('This message prints every minute.');
// };

// // Schedule the task using cron syntax
// // This example schedules the task to run every minute
// cron.schedule('*/5 * * * * *', task);
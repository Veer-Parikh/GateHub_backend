const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

// Load .env before anything that reads process.env at require time.
dotenv.config();

const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

// CORS_ORIGIN is required in production and may contain comma-separated origins.
const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

if (isProduction && (process.env.DEMO_MODE === 'true' || !process.env.JWT_SECRET || configuredOrigins.length === 0)) {
    throw new Error('Production requires DEMO_MODE=false, JWT_SECRET, and CORS_ORIGIN.');
}

const corsOrigins = configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:3000'];

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || corsOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('Origin is not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 600,
    })
);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '100kb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.FORM_BODY_LIMIT || '100kb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT || 300),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT || 20),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { message: 'Too many sign-in attempts. Please try again later.' },
});

app.use('/api', apiLimiter);
app.use(['/api/user/login', '/api/user/signup', '/api/security/login', '/api/security/signup', '/api/plumber/login', '/api/plumber/signup', '/api/laundry/login', '/api/laundry/signup'], authLimiter);

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
    logger.warn({ err: err.message, method: req.method, path: req.originalUrl, status }, 'Request failed');
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
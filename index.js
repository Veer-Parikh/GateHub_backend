const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')
const logger = require("./utils/logger")

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
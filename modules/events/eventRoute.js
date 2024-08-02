const { createEvent,deleteEvent,getEvent,getEvents } = require('./eventController')
const express = require('express');
const router = express.Router();
const prisma = require("../../utils/prisma")
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post("/create",authorizeAdmin,createEvent);
router.get("/all",getEvents);
router.get("/byId/:id",getEvent);
router.delete("/delete/:id",deleteEvent);

module.exports = router;
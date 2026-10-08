const { createEvent,deleteEvent,getEvent,getEvents } = require('./eventController')
const express = require('express');
const router = express.Router();
const { authorizeAdmin } = require("../../middleware/authJWT")

// createEvent also re-checks isAdmin against the database.
router.post("/create",authorizeAdmin,createEvent);
router.get("/all",getEvents);
router.get("/byId/:id",getEvent);
router.delete("/delete/:id",authorizeAdmin,deleteEvent);

module.exports = router;

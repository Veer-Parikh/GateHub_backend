const express = require('express');
const router = express.Router();
const { createBooking,deleteBooking,getPlumberBookings,getUserBookings } = require("./bookingController")
const prisma = require("../../utils/prisma")

router.post('/create', createBooking);
router.get('/getUser/:id', getUserBookings);
router.delete('/delete/:id', deleteBooking)
router.get('/getPlumber/:id', getPlumberBookings)

module.exports = router
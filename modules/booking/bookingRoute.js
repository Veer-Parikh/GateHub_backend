const express = require('express');
const router = express.Router();
const { createBooking,deleteBooking,getPlumberBookings,getUserBookings,getLaundryBookings } = require("./bookingController")
const prisma = require("../../utils/prisma")

router.post('/create', createBooking);
router.get('/getUser/:id/:searchWord', getUserBookings);
router.delete('/delete/:id', deleteBooking)
router.get('/getPlumber/:id', getPlumberBookings)
router.get('/getLaundry/:id', getLaundryBookings)

module.exports = router
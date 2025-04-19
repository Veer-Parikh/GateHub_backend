const express = require('express');
const router = express.Router();
const { createBooking,deleteBooking,getPlumberBookings,getUserBookings,getLaundryBookings } = require("./bookingController")
const prisma = require("../../utils/prisma");
const { authenticate } = require('../../middleware/authJWT');

router.post('/create', authenticate,createBooking);
router.get('/getUser',authenticate ,getUserBookings);
router.delete('/delete/:id', deleteBooking)
router.get('/getPlumber', authenticate,getPlumberBookings)
router.get('/getLaundry',authenticate, getLaundryBookings)

module.exports = router
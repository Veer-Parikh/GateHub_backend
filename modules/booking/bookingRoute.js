const express = require('express');
const router = express.Router();
const { createBooking,deleteBooking,getPlumberBookings,getUserBookings,getLaundryBookings } = require("./bookingController")
const { authenticate } = require('../../middleware/authJWT');

router.post('/create', authenticate,createBooking);
router.get('/getUser',authenticate ,getUserBookings);
router.delete('/delete/:id', authenticate,deleteBooking)
router.get('/getPlumber', authenticate,getPlumberBookings)
router.get('/getLaundry',authenticate, getLaundryBookings)

module.exports = router

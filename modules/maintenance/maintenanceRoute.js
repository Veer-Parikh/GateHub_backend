const { sendMaintenance, paid, getAllUnpaid, getUserUnpaid, getUserPaid } = require('./maintenanceController')
const express = require('express');
const router = express.Router();
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post("/send",authorizeAdmin,sendMaintenance)
// Residents call this after a Razorpay payment; `paid` checks admin OR membership of the bill's room.
router.patch("/update",authenticate,paid)
router.get("/allUnpaid",authorizeAdmin,getAllUnpaid)
router.get("/userUnpaid",authenticate,getUserUnpaid)
router.get("/userPaid",authenticate,getUserPaid)


module.exports = router

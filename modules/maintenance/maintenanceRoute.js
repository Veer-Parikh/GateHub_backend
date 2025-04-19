const { sendMaintenance, paid, getAllUnpaid, getUserUnpaid, getUserPaid } = require('./maintenanceController')
const express = require('express');
const router = express.Router();
const prisma = require("../../utils/prisma")
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post("/send",authorizeAdmin,sendMaintenance)
router.patch("/update",authorizeAdmin,paid)
router.get("/allUnpaid",authorizeAdmin,getAllUnpaid)
router.get("/userUnpaid",authenticate,getUserUnpaid)
router.get("/userPaid",authenticate,getUserPaid)


module.exports = router
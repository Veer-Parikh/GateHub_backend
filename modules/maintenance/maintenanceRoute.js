const { sendMaintenance, paid, getAllUnpaid, getUserUnpaid } = require('./maintenanceController')
const express = require('express');
const router = express.Router();
const prisma = require("../../utils/prisma")
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post("/send",authorizeAdmin,sendMaintenance)
router.patch("/update",authorizeAdmin,paid)
router.get("/allUnpaid",authorizeAdmin,getAllUnpaid)
router.get("/userUnpaid/:id",getUserUnpaid)

module.exports = router
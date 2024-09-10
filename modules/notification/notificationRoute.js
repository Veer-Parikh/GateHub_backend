const {deleteNotif,getUserNotif,update} = require("./notificationController")
const express = require('express');
const router = express.Router();
const prisma = require("../../utils/prisma")

router.delete("/delete/notificationId",deleteNotif)
router.get("/myNotif/id",getUserNotif)
router.patch("/visit/notificationId",update)

module.exports = router
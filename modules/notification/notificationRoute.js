const {deleteNotif,getUserNotif,update,getMyNotifs} = require("./notificationController")
const express = require('express');
const router = express.Router();
const { authenticate } = require("../../middleware/authJWT")

router.get("/my",authenticate,getMyNotifs)
router.delete("/delete/:notificationId",authenticate,deleteNotif)
router.get("/myNotif/:id",authenticate,getUserNotif)
router.patch("/visit/:notificationId",authenticate,update)

module.exports = router

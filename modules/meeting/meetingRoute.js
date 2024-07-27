const {createMeeting,getAllMeetings,getMeetingByMeetingId,getMeetingBySearch,completeMeeting,updateMeeting,deleteMeeting,incompleteMeeting,getCompleteMeeting,getIncompleteMeeting } = require('./meetingController')
const express = require('express');
const router = express.Router();
const prisma = require("../../utils/prisma")
const { authenticate,authorizeAdmin } = require("../../middleware/authJWT")

router.post("/create",authorizeAdmin,createMeeting);
router.get("/all",getAllMeetings);
router.get("/byId/:id",getMeetingByMeetingId);
router.get("/search/:searchWord",getMeetingBySearch);
router.put("/complete/:meetingId",completeMeeting);
router.put("/incomplete/:meetingId",incompleteMeeting);
router.get("/completed",getCompleteMeeting);
router.get("/incompleted",getIncompleteMeeting);
router.put("/update/:meetingId",authorizeAdmin,updateMeeting);
router.delete("/delete/:id",deleteMeeting);

module.exports = router;
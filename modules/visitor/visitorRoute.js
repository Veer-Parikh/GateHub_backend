const { createVisitor,delVisitor,getWaiting,inside,getInside,getNotified } = require('./visitorController')
const express = require('express');
const router = express.Router();
const prisma = require("../../utils/prisma")

router.post('/create',createVisitor)
router.delete('/delete',delVisitor)
router.get('/waiting',getWaiting)
router.get('/getInside',getInside)
router.get('/notified',getNotified)
router.put('/inside',inside)

module.exports = router
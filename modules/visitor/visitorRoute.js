const { createVisitor,delVisitor,getWaiting,inside,getInside,getNotified, prevVisitorsInUser, hasLeft } = require('./visitorController')
const express = require('express');
const router = express.Router();
const { authenticateSecurity, authenticate } = require('../../middleware/authJWT');

router.post('/create',authenticateSecurity, createVisitor)
router.delete('/delete',authenticate,delVisitor)
router.get('/waiting',authenticate,getWaiting)
router.get('/getInside',authenticate,getInside)
router.get('/notified',getNotified)
router.put('/inside',authenticate,inside)
router.get('/prev',authenticate,prevVisitorsInUser)
router.put('/hasLeft',authenticate,hasLeft)

module.exports = router

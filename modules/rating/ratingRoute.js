const express = require('express');
const router = express.Router();
const { createRating,deleteRating,getPlumberRatings,getUserRatings } = require("./ratingController")
const { authenticate } = require('../../middleware/authJWT');

router.post('/create', authenticate,createRating);
router.get('/getUser/:id', getUserRatings);
router.delete('/delete/:id', authenticate,deleteRating)
router.get('/getPlumber/:id', getPlumberRatings)

module.exports = router

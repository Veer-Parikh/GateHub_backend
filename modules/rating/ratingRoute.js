const express = require('express');
const router = express.Router();
const { createRating,deleteRating,getPlumberRatings,getUserRatings } = require("./ratingController")
const prisma = require("../../utils/prisma")

router.post('/create', createRating);
router.get('/getUser/:id', getUserRatings);
router.delete('/delete/:id', deleteRating)
router.get('/getPlumber/:id', getPlumberRatings)

module.exports = router
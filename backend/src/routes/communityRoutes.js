const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/leaderboard', communityController.getLeaderboard);
router.get('/city-rankings/:city', communityController.getCityRankings);

module.exports = router;

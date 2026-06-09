const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/overview', authenticateToken, dashboardController.getOverview);
router.get('/recommendations', authenticateToken, dashboardController.getRecommendations);

module.exports = router;

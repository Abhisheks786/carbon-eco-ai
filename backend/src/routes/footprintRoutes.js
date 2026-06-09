const express = require('express');
const router = express.Router();
const footprintController = require('../controllers/footprintController');
const validate = require('../middleware/validate');
const schemas = require('../validators/schema');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/calculate', authenticateToken, validate(schemas.footprintCalculateSchema), footprintController.calculateFootprint);
router.get('/history', authenticateToken, footprintController.getHistory);
router.get('/monthly/:year/:month', authenticateToken, footprintController.getMonthly);

module.exports = router;

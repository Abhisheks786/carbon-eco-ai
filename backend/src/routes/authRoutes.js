const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const schemas = require('../validators/schema');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/signup', validate(schemas.signupSchema), authController.signup);
router.post('/login', validate(schemas.loginSchema), authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validate(schemas.profileUpdateSchema), authController.updateProfile);

module.exports = router;

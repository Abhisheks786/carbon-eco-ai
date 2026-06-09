const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateFootprint = [
  body('carUsage').isFloat({ min: 0 }).optional(),
  body('publicTransport').isFloat({ min: 0 }).optional(),
  body('trainUsage').isFloat({ min: 0 }).optional(),
  body('flights').isFloat({ min: 0 }).optional(),
  body('electricity').isFloat({ min: 0 }).optional(),
  body('gas').isFloat({ min: 0 }).optional(),
  body('renewableUsage').isFloat({ min: 0, max: 100 }).optional(),
  body('dietType').isIn(['vegetarian', 'vegan', 'mixed', 'highMeat']).optional(),
  validateRequest,
];

const validateUser = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail(),
  body('city').trim().optional().isLength({ max: 100 }),
  body('bio').trim().optional().isLength({ max: 500 }),
  validateRequest,
];

module.exports = {
  validateFootprint,
  validateUser,
  validateRequest,
};

// backend/middleware/auth.js
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    // Check if user is admin
    const adminIds = (process.env.ADMIN_IDS || '').split(',');
    if (!adminIds.includes(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

module.exports = { authenticateToken, authenticateAdmin };

// backend/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Unique constraint violation',
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later',
});

module.exports = { limiter, strictLimiter };

// backend/middleware/validation.js
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

// backend/utils/logger.js
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, message, data || '');
    appendLog(`${timestamp} INFO: ${message} ${JSON.stringify(data || '')}\n`);
  },

  error: (message, error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, message, error);
    appendLog(
      `${timestamp} ERROR: ${message} ${error?.stack || error?.message || error}\n`
    );
  },

  warn: (message, data) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN:`, message, data || '');
    appendLog(`${timestamp} WARN: ${message} ${JSON.stringify(data || '')}\n`);
  },
};

function appendLog(message) {
  const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, message);
}

module.exports = logger;

// backend/utils/emissionCalculator.js
const EMISSION_FACTORS = {
  car: 0.21,
  publicTransport: 0.089,
  train: 0.041,
  flight: 0.255,
  electricity: 0.85,
  gas: 2.04,
  vegetarian: 1.5,
  vegan: 1.0,
  mixed: 2.5,
  highMeat: 4.0,
  clothing: 7.0,
  electronics: 50.0,
  goods: 0.1,
  recycling: 0.02,
  landfill: 0.06,
};

const calculateEmissions = (data) => {
  // Transportation (daily)
  const dailyTransport =
    (data.carUsage || 0) * EMISSION_FACTORS.car +
    (data.publicTransport || 0) * EMISSION_FACTORS.publicTransport +
    (data.trainUsage || 0) * EMISSION_FACTORS.train +
    (data.flights || 0) * EMISSION_FACTORS.flight;

  // Energy (monthly)
  const monthlyEnergy =
    (data.electricity || 0) * EMISSION_FACTORS.electricity +
    (data.gas || 0) * EMISSION_FACTORS.gas;

  const adjustedEnergy =
    monthlyEnergy * (1 - (data.renewableUsage || 0) / 100);

  // Food (daily)
  const dietEmissions =
    EMISSION_FACTORS[data.dietType || 'mixed'];

  // Shopping (monthly)
  const monthlyShipping =
    (data.clothingPurchases || 0) * EMISSION_FACTORS.clothing +
    (data.electronicsPurchases || 0) * EMISSION_FACTORS.electronics +
    (data.generalGoods || 0) * EMISSION_FACTORS.goods;

  // Waste (weekly)
  const weeklyWaste =
    (data.weeklyWaste || 0) *
    (((data.recyclingRate || 0) / 100) * EMISSION_FACTORS.recycling +
      ((100 - (data.recyclingRate || 0)) / 100) * EMISSION_FACTORS.landfill);

  // Calculate totals
  const daily =
    dailyTransport +
    adjustedEnergy / 30 +
    dietEmissions +
    monthlyShipping / 30 +
    weeklyWaste / 7;

  const monthly = daily * 30;
  const yearly = daily * 365;

  return {
    daily: Math.max(0, daily),
    monthly: Math.max(0, monthly),
    yearly: Math.max(0, yearly),
    breakdown: {
      transportation: Math.max(0, dailyTransport * 365),
      energy: Math.max(0, adjustedEnergy * 12),
      food: Math.max(0, dietEmissions * 365),
      shopping: Math.max(0, monthlyShipping * 12),
      waste: Math.max(0, weeklyWaste * 52),
    },
  };
};

module.exports = { calculateEmissions, EMISSION_FACTORS };

// backend/utils/helpers.js
const generateRecommendations = (footprint) => {
  const recommendations = [];
  const total = footprint.yearly;

  // Transportation recommendations
  if (footprint.breakdown.transportation > total * 0.4) {
    recommendations.push({
      title: 'Reduce Car Usage',
      description:
        'Your transportation is your biggest emission source. Try using public transport 2-3 days a week.',
      estimatedSavings: 500,
      difficulty: 'medium',
      category: 'transportation',
    });
  }

  // Energy recommendations
  if (footprint.breakdown.energy > total * 0.25) {
    recommendations.push({
      title: 'Switch to Renewable Energy',
      description:
        'Consider solar panels or signing up for renewable energy plans.',
      estimatedSavings: 800,
      difficulty: 'hard',
      category: 'energy',
    });
  }

  // Food recommendations
  if (footprint.breakdown.food > total * 0.2) {
    recommendations.push({
      title: 'Adopt Plant-Based Diet',
      description:
        'Going vegetarian one day a week can reduce your food emissions significantly.',
      estimatedSavings: 200,
      difficulty: 'easy',
      category: 'food',
    });
  }

  return recommendations;
};

const getLevelFromXP = (xp) => {
  const levels = [
    { name: 'Bronze', minXP: 0 },
    { name: 'Silver', minXP: 1000 },
    { name: 'Gold', minXP: 2500 },
    { name: 'Platinum', minXP: 5000 },
    { name: 'Diamond', minXP: 10000 },
  ];

  return levels.reverse().find((level) => xp >= level.minXP) || levels[0];
};

module.exports = { generateRecommendations, getLevelFromXP };

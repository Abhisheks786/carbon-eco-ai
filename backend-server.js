// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// ============ AUTH ROUTES ============
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create database user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        firebaseId: userRecord.uid,
        settings: {
          create: {},
        },
        communityScore: {
          create: {},
        },
      },
    });

    res.json({ user, firebaseId: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Frontend handles Firebase login, backend just validates
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, city, country, avatar } = req.body;

    const user = await prisma.user.update({
      where: { firebaseId: req.userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(city && { city }),
        ...(country && { country }),
        ...(avatar && { avatar }),
      },
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ FOOTPRINT ROUTES ============
app.post('/api/footprint/calculate', authenticateToken, async (req, res) => {
  try {
    const {
      carUsage,
      publicTransport,
      trainUsage,
      flights,
      electricity,
      gas,
      renewableUsage,
      dietType,
      clothingPurchases,
      electronicsPurchases,
      generalGoods,
      recyclingRate,
      weeklyWaste,
      totalDaily,
      totalMonthly,
      totalYearly,
      transportEmission,
      energyEmission,
      foodEmission,
      shoppingEmission,
      wasteEmission,
    } = req.body;

    const footprint = await prisma.carbonFootprint.create({
      data: {
        userId: (await prisma.user.findUnique({ where: { firebaseId: req.userId } })).id,
        carUsage,
        publicTransport,
        trainUsage,
        flights,
        electricity,
        gas,
        renewableUsage,
        dietType,
        clothingPurchases,
        electronicsPurchases,
        generalGoods,
        recyclingRate,
        weeklyWaste,
        totalDaily,
        totalMonthly,
        totalYearly,
        transportEmission,
        energyEmission,
        foodEmission,
        shoppingEmission,
        wasteEmission,
      },
    });

    // Award XP
    await awardXP(req.userId, 50, 'calculation');

    res.json(footprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/footprint/history', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });

    const footprints = await prisma.carbonFootprint.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    res.json(footprints);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/footprint/monthly/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const footprints = await prisma.carbonFootprint.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalDaily = footprints.reduce((sum, f) => sum + f.totalDaily, 0) / footprints.length || 0;
    const totalMonthly = footprints.reduce((sum, f) => sum + f.totalMonthly, 0) / footprints.length || 0;

    res.json({
      month,
      year,
      days: footprints.length,
      totalDaily,
      totalMonthly,
      data: footprints,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ DASHBOARD ROUTES ============
app.get('/api/dashboard/overview', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.userId },
      include: { communityScore: true },
    });

    const latestFootprint = await prisma.carbonFootprint.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    const lastMonthFootprint = await prisma.carbonFootprint.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
      orderBy: { date: 'desc' },
    });

    const twoMonthsAgoFootprint = await prisma.carbonFootprint.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        },
      },
      orderBy: { date: 'desc' },
    });

    const reduction =
      lastMonthFootprint && twoMonthsAgoFootprint
        ? ((lastMonthFootprint.totalMonthly - twoMonthsAgoFootprint.totalMonthly) /
            twoMonthsAgoFootprint.totalMonthly) *
          100
        : 0;

    res.json({
      carbonScore: latestFootprint?.totalDaily || 0,
      monthlyTotal: lastMonthFootprint?.totalMonthly || 0,
      yearlyTotal: (lastMonthFootprint?.totalMonthly || 0) * 12,
      reduction,
      level: user.communityScore?.level || 1,
      xp: user.communityScore?.xpPoints || 0,
      breakdown: latestFootprint
        ? {
            transportation: latestFootprint.transportEmission,
            energy: latestFootprint.energyEmission,
            food: latestFootprint.foodEmission,
            shopping: latestFootprint.shoppingEmission,
            waste: latestFootprint.wasteEmission,
          }
        : {},
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/dashboard/recommendations', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });

    // Get latest footprint
    const footprint = await prisma.carbonFootprint.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    // Generate recommendations based on emissions
    const recommendations = [];

    if (footprint) {
      if (footprint.transportEmission > 2000) {
        recommendations.push({
          id: '1',
          title: 'Reduce Car Usage',
          description: 'Your transportation is your biggest emission source. Try using public transport 2-3 days a week.',
          estimatedSavings: 500,
          difficulty: 'medium',
          category: 'transportation',
        });
      }

      if (footprint.energyEmission > 1000) {
        recommendations.push({
          id: '2',
          title: 'Switch to Renewable Energy',
          description: 'Consider solar panels or signing up for renewable energy plans.',
          estimatedSavings: 800,
          difficulty: 'hard',
          category: 'energy',
        });
      }

      if (footprint.foodEmission > 800) {
        recommendations.push({
          id: '3',
          title: 'Adopt Plant-Based Diet',
          description: 'Going vegetarian one day a week can reduce your food emissions significantly.',
          estimatedSavings: 200,
          difficulty: 'easy',
          category: 'food',
        });
      }
    }

    res.json(recommendations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ COMMUNITY ROUTES ============
app.get('/api/community/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit || 50;

    const leaderboard = await prisma.communityScore.findMany({
      orderBy: { xpPoints: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: { name, avatar, city },
        },
      },
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/community/city-rankings/:city', async (req, res) => {
  try {
    const { city } = req.params;

    const rankings = await prisma.communityScore.findMany({
      where: {
        user: {
          city,
        },
      },
      orderBy: { xpPoints: 'desc' },
      include: {
        user: {
          select: { name, avatar },
        },
      },
    });

    res.json(rankings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ ACHIEVEMENTS ROUTES ============
app.get('/api/achievements/user', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });

    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: 'desc' },
    });

    res.json(achievements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ HELPERS ============
async function awardXP(firebaseId, points, activity) {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId },
      include: { communityScore: true },
    });

    if (user && user.communityScore) {
      await prisma.communityScore.update({
        where: { id: user.communityScore.id },
        data: {
          xpPoints: {
            increment: points,
          },
          level: Math.floor((user.communityScore.xpPoints + points) / 1000) + 1,
        },
      });
    }
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
}

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EcoTrack AI Backend running on port ${PORT}`);
});

module.exports = app;

const prisma = require('../services/db');
const { generateRecommendations: aiGenerateRecommendations } = require('../services/aiService');

const getOverview = async (req, res) => {
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
};

const getRecommendations = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });

    // Get latest footprint
    const footprint = await prisma.carbonFootprint.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    let breakdown = null;
    if (footprint) {
      breakdown = {
        transportation: footprint.transportEmission,
        energy: footprint.energyEmission,
        food: footprint.foodEmission,
        shopping: footprint.shoppingEmission,
        waste: footprint.wasteEmission,
      };
    }

    const recommendations = await aiGenerateRecommendations(breakdown);

    res.json(recommendations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getOverview,
  getRecommendations,
};

const prisma = require('../services/db');
const { getCache, setCache } = require('../services/redisClient');
const { addJob } = require('../jobs/worker');

const getLeaderboard = async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const cacheKey = `leaderboard_${limit}`;

    // Try to get from cache
    const cachedLeaderboard = await getCache(cacheKey);
    if (cachedLeaderboard) {
      return res.json(cachedLeaderboard);
    }

    const leaderboard = await prisma.communityScore.findMany({
      orderBy: { xpPoints: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: { name: true, avatar: true, city: true },
        },
      },
    });

    // Save to cache for 1 hour
    await setCache(cacheKey, leaderboard, 3600);
    
    // Kick off a background job to process deeper community stats
    await addJob('refreshLeaderboard', { limit }, { delay: 10000 });

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCityRankings = async (req, res) => {
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
          select: { name: true, avatar: true },
        },
      },
    });

    res.json(rankings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getCityRankings,
};

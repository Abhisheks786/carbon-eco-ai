const prisma = require('../services/db');

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

module.exports = { awardXP };

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

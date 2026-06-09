export const formatCO2 = (value: number): string => {
  return `${value.toFixed(2)} kg CO₂`;
};

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1;
};

export const getLevelName = (level: number): string => {
  const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  return levels[Math.min(level - 1, levels.length - 1)];
};

export const getEmissionColor = (value: number, max: number): string => {
  const percentage = (value / max) * 100;
  if (percentage < 33) return '#10b981'; // green
  if (percentage < 66) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

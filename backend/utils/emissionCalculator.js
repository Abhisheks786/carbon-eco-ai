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

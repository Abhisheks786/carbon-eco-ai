const prisma = require('../services/db');
const { calculateEmissions } = require('../../utils/emissionCalculator'); // Will move utils to src/services later if needed, but for now it is in backend/utils

const calculateFootprint = async (req, res) => {
  try {
    const data = req.body;
    
    // Server-side calculation replaces client trust
    const emissions = calculateEmissions(data);
    
    const footprint = await prisma.carbonFootprint.create({
      data: {
        userId: (await prisma.user.findUnique({ where: { firebaseId: req.userId } })).id,
        carUsage: data.carUsage,
        publicTransport: data.publicTransport,
        trainUsage: data.trainUsage,
        flights: data.flights,
        electricity: data.electricity,
        gas: data.gas,
        renewableUsage: data.renewableUsage,
        dietType: data.dietType,
        clothingPurchases: data.clothingPurchases,
        electronicsPurchases: data.electronicsPurchases,
        generalGoods: data.generalGoods,
        recyclingRate: data.recyclingRate,
        weeklyWaste: data.weeklyWaste,
        
        // Calculated securely on the server
        totalDaily: emissions.daily,
        totalMonthly: emissions.monthly,
        totalYearly: emissions.yearly,
        transportEmission: emissions.breakdown.transportation,
        energyEmission: emissions.breakdown.energy,
        foodEmission: emissions.breakdown.food,
        shoppingEmission: emissions.breakdown.shopping,
        wasteEmission: emissions.breakdown.waste,
      },
    });

    res.json(footprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getHistory = async (req, res) => {
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
};

const getMonthly = async (req, res) => {
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
};

module.exports = {
  calculateFootprint,
  getHistory,
  getMonthly,
};

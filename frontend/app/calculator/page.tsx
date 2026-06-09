'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCO2 } from '@/lib/utils';

interface FootprintData {
  transportation: {
    carUsage: number;
    bikeUsage: number;
    publicTransport: number;
    trainUsage: number;
    flights: number;
  };
  energy: {
    electricity: number;
    gas: number;
    renewableUsage: number;
  };
  food: {
    dietType: string;
  };
  shopping: {
    clothingPurchases: number;
    electronicsPurchases: number;
    generalGoods: number;
  };
  waste: {
    recyclingRate: number;
    weeklyWaste: number;
  };
}

const INITIAL_DATA: FootprintData = {
  transportation: {
    carUsage: 0,
    bikeUsage: 0,
    publicTransport: 0,
    trainUsage: 0,
    flights: 0,
  },
  energy: {
    electricity: 0,
    gas: 0,
    renewableUsage: 0,
  },
  food: {
    dietType: 'mixed',
  },
  shopping: {
    clothingPurchases: 0,
    electronicsPurchases: 0,
    generalGoods: 0,
  },
  waste: {
    recyclingRate: 0,
    weeklyWaste: 0,
  },
};

// Emissions factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  // Transportation
  car: 0.21, // per km
  bike: 0,
  publicTransport: 0.089, // per km
  train: 0.041, // per km
  flight: 0.255, // per km

  // Energy
  electricity: 0.85, // per kWh (varies by region)
  gas: 2.04, // per unit

  // Food (kg CO2 per day)
  vegetarian: 1.5,
  vegan: 1.0,
  mixed: 2.5,
  highMeat: 4.0,

  // Shopping
  clothing: 7.0, // per item
  electronics: 50.0, // per item
  goods: 0.1, // per dollar spent

  // Waste
  recycling: 0.02, // per kg
  landfill: 0.06, // per kg
};

export default function Calculator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('transportation');
  const [data, setData] = useState<FootprintData>(INITIAL_DATA);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const tabs = [
    { id: 'transportation', label: '🚗 Transportation' },
    { id: 'energy', label: '⚡ Energy' },
    { id: 'food', label: '🍽️ Food' },
    { id: 'shopping', label: '🛍️ Shopping' },
    { id: 'waste', label: '♻️ Waste' },
  ];

  const calculateEmissions = async () => {
    setIsCalculating(true);

    // Calculate transportation
    const dailyTransport =
      data.transportation.carUsage * EMISSION_FACTORS.car +
      data.transportation.publicTransport * EMISSION_FACTORS.publicTransport +
      data.transportation.trainUsage * EMISSION_FACTORS.train +
      data.transportation.flights * EMISSION_FACTORS.flight;

    // Calculate energy (monthly)
    const monthlyEnergy =
      data.energy.electricity * EMISSION_FACTORS.electricity +
      data.energy.gas * EMISSION_FACTORS.gas;

    // Adjust for renewable energy
    const adjustedEnergy = monthlyEnergy * (1 - data.energy.renewableUsage / 100);

    // Calculate food (daily)
    const dietEmissions = EMISSION_FACTORS[data.food.dietType as keyof typeof EMISSION_FACTORS];

    // Calculate shopping (monthly)
    const monthlyShipping =
      data.shopping.clothingPurchases * EMISSION_FACTORS.clothing +
      data.shopping.electronicsPurchases * EMISSION_FACTORS.electronics +
      data.shopping.generalGoods * EMISSION_FACTORS.goods;

    // Calculate waste (weekly)
    const weeklyWaste =
      data.waste.weeklyWaste *
      (data.waste.recyclingRate / 100 *
        EMISSION_FACTORS.recycling +
        ((100 - data.waste.recyclingRate) / 100) *
        EMISSION_FACTORS.landfill);

    // Convert to daily/monthly/yearly
    const daily =
      dailyTransport +
      adjustedEnergy / 30 +
      dietEmissions +
      monthlyShipping / 30 +
      weeklyWaste / 7;

    const monthly = daily * 30;
    const yearly = daily * 365;

    const emissions = {
      daily,
      monthly,
      yearly,
      breakdown: {
        transportation: dailyTransport * 365,
        energy: adjustedEnergy * 12,
        food: dietEmissions * 365,
        shopping: monthlyShipping * 12,
        waste: weeklyWaste * 52,
      },
    };

    setResult(emissions);

    // Save to database if user is authenticated
    if (user) {
      try {
        await apiClient.calculateFootprint({
          ...data,
          totalDaily: emissions.daily,
          totalMonthly: emissions.monthly,
          totalYearly: emissions.yearly,
          transportEmission: emissions.breakdown.transportation,
          energyEmission: emissions.breakdown.energy,
          foodEmission: emissions.breakdown.food,
          shoppingEmission: emissions.breakdown.shopping,
          wasteEmission: emissions.breakdown.waste,
        });
      } catch (error) {
        console.error('Error saving footprint:', error);
      }
    }

    setIsCalculating(false);
  };

  const handleInputChange = (
    category: keyof FootprintData,
    field: string,
    value: number | string
  ) => {
    setData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Carbon Footprint Calculator
          </h1>
          <p className="text-slate-400">
            Calculate your daily, monthly, and yearly carbon emissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Transportation Tab */}
            {activeTab === 'transportation' && (
              <div className="space-y-4">
                <InputField
                  label="Car Usage (km/day)"
                  value={data.transportation.carUsage}
                  onChange={(val) =>
                    handleInputChange('transportation', 'carUsage', val)
                  }
                  help="Average kilometers driven per day"
                />
                <InputField
                  label="Public Transport (km/day)"
                  value={data.transportation.publicTransport}
                  onChange={(val) =>
                    handleInputChange('transportation', 'publicTransport', val)
                  }
                  help="Bus, metro, subway kilometers"
                />
                <InputField
                  label="Train Usage (km/day)"
                  value={data.transportation.trainUsage}
                  onChange={(val) =>
                    handleInputChange('transportation', 'trainUsage', val)
                  }
                  help="Train commute kilometers"
                />
                <InputField
                  label="Bike Usage (km/day)"
                  value={data.transportation.bikeUsage}
                  onChange={(val) =>
                    handleInputChange('transportation', 'bikeUsage', val)
                  }
                  help="Cycling kilometers (zero emissions)"
                />
                <InputField
                  label="Flights (hours/month)"
                  value={data.transportation.flights}
                  onChange={(val) =>
                    handleInputChange('transportation', 'flights', val)
                  }
                  help="Air travel hours per month"
                />
              </div>
            )}

            {/* Energy Tab */}
            {activeTab === 'energy' && (
              <div className="space-y-4">
                <InputField
                  label="Electricity Usage (kWh/month)"
                  value={data.energy.electricity}
                  onChange={(val) =>
                    handleInputChange('energy', 'electricity', val)
                  }
                  help="Monthly electricity consumption"
                />
                <InputField
                  label="Gas/LPG Usage (units/month)"
                  value={data.energy.gas}
                  onChange={(val) => handleInputChange('energy', 'gas', val)}
                  help="Cooking and heating gas"
                />
                <InputField
                  label="Renewable Energy (%)"
                  value={data.energy.renewableUsage}
                  onChange={(val) =>
                    handleInputChange('energy', 'renewableUsage', val)
                  }
                  help="Percentage from solar/wind"
                />
              </div>
            )}

            {/* Food Tab */}
            {activeTab === 'food' && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-slate-300 font-medium mb-2 block">
                    Diet Type
                  </span>
                  <select
                    value={data.food.dietType}
                    onChange={(e) =>
                      handleInputChange('food', 'dietType', e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="vegan">🌱 Vegan</option>
                    <option value="vegetarian">🥗 Vegetarian</option>
                    <option value="mixed">🍗 Mixed Diet</option>
                    <option value="highMeat">🥩 High Meat Consumption</option>
                  </select>
                </label>
              </div>
            )}

            {/* Shopping Tab */}
            {activeTab === 'shopping' && (
              <div className="space-y-4">
                <InputField
                  label="Clothing Purchases (items/month)"
                  value={data.shopping.clothingPurchases}
                  onChange={(val) =>
                    handleInputChange('shopping', 'clothingPurchases', val)
                  }
                />
                <InputField
                  label="Electronics Purchases (items/month)"
                  value={data.shopping.electronicsPurchases}
                  onChange={(val) =>
                    handleInputChange('shopping', 'electronicsPurchases', val)
                  }
                />
                <InputField
                  label="General Goods ($/month)"
                  value={data.shopping.generalGoods}
                  onChange={(val) =>
                    handleInputChange('shopping', 'generalGoods', val)
                  }
                />
              </div>
            )}

            {/* Waste Tab */}
            {activeTab === 'waste' && (
              <div className="space-y-4">
                <InputField
                  label="Weekly Waste (kg/week)"
                  value={data.waste.weeklyWaste}
                  onChange={(val) =>
                    handleInputChange('waste', 'weeklyWaste', val)
                  }
                  help="Total waste generated per week"
                />
                <InputField
                  label="Recycling Rate (%)"
                  value={data.waste.recyclingRate}
                  onChange={(val) =>
                    handleInputChange('waste', 'recyclingRate', val)
                  }
                  help="Percentage of waste recycled"
                />
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={calculateEmissions}
              disabled={isCalculating}
              className="w-full mt-8 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Emissions'}
            </button>
          </div>

          {/* Results Panel */}
          {result && (
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Your Footprint
                </h2>

                <div className="space-y-4 mb-8">
                  <ResultItem
                    label="Daily Emissions"
                    value={formatCO2(result.daily)}
                    icon="📅"
                  />
                  <ResultItem
                    label="Monthly Emissions"
                    value={formatCO2(result.monthly)}
                    icon="📊"
                  />
                  <ResultItem
                    label="Yearly Emissions"
                    value={formatCO2(result.yearly)}
                    icon="📈"
                  />
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(result.breakdown).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <span className="text-emerald-400 font-medium">
                          {formatCO2(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-6 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors">
                  View Tips
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable InputField Component
function InputField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="text-slate-300 font-medium mb-1 block">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
        min="0"
        step="0.1"
      />
      {help && <p className="text-xs text-slate-500 mt-1">{help}</p>}
    </label>
  );
}

// Result Item Component
function ResultItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-emerald-400">{value}</p>
    </div>
  );
}

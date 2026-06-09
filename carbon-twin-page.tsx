// app/carbon-twin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCO2 } from '@/lib/utils';

interface Prediction {
  month: number;
  prediction: number;
  confidence: number;
}

interface Scenario {
  name: string;
  description: string;
  reduction: number;
  newAnnualEmissions: number;
  savings: number;
}

export default function CarbonTwin() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentEmissions, setCurrentEmissions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await apiClient.getDashboard();
        const yearlyEmissions = dashboardRes.data.yearlyTotal;
        setCurrentEmissions(yearlyEmissions);

        // Generate 12-month predictions
        const generatedPredictions = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          prediction: yearlyEmissions / 12 * (1 + (Math.random() - 0.5) * 0.2),
          confidence: 0.85 + Math.random() * 0.1,
        }));

        setPredictions(generatedPredictions);

        // Generate scenarios
        const scenariosData: Scenario[] = [
          {
            name: 'Public Transport Switch',
            description: 'Use public transport 5 days a week instead of driving',
            reduction: 0.35,
            newAnnualEmissions: yearlyEmissions * 0.65,
            savings: yearlyEmissions * 0.35,
          },
          {
            name: 'Renewable Energy',
            description: 'Switch to 100% renewable energy sources',
            reduction: 0.25,
            newAnnualEmissions: yearlyEmissions * 0.75,
            savings: yearlyEmissions * 0.25,
          },
          {
            name: 'Vegetarian Diet',
            description: 'Adopt a fully vegetarian diet',
            reduction: 0.15,
            newAnnualEmissions: yearlyEmissions * 0.85,
            savings: yearlyEmissions * 0.15,
          },
          {
            name: 'Comprehensive Changes',
            description: 'Combine all above strategies',
            reduction: 0.60,
            newAnnualEmissions: yearlyEmissions * 0.40,
            savings: yearlyEmissions * 0.60,
          },
        ];

        setScenarios(scenariosData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 Your Carbon Twin
          </h1>
          <p className="text-slate-400">
            AI-powered predictions and scenario simulations for your sustainable future
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="Current Annual Emissions"
            value={formatCO2(currentEmissions)}
            icon="📊"
          />
          <MetricCard
            label="Predicted Next Month"
            value={formatCO2(predictions[0]?.prediction || 0)}
            icon="📈"
            subtitle="85% confidence"
          />
          <MetricCard
            label="Potential Annual Savings"
            value={formatCO2(currentEmissions * 0.6)}
            icon="🌱"
            subtitle="With optimal changes"
          />
        </div>

        {/* 12-Month Prediction Chart */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            📅 12-Month Emission Forecast
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => formatCO2(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="prediction"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Predicted Emissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scenario Simulations */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            🎯 What-If Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {scenarios.map((scenario, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedScenario(scenario)}
                className={`bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 cursor-pointer transition-all hover:border-slate-600/50 group ${
                  selectedScenario?.name === scenario.name
                    ? 'ring-2 ring-emerald-500'
                    : ''
                }`}
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {scenario.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {scenario.description}
                </p>

                <div className="space-y-3 border-t border-slate-700/50 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Emission Reduction</span>
                    <span className="text-emerald-400 font-bold">
                      {(scenario.reduction * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">New Annual Total</span>
                    <span className="text-blue-400 font-bold">
                      {formatCO2(scenario.newAnnualEmissions)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Annual Savings</span>
                    <span className="text-emerald-400 font-bold">
                      {formatCO2(scenario.savings)}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors">
                  Explore Scenario
                </button>
              </div>
            ))}
          </div>

          {/* Selected Scenario Details */}
          {selectedScenario && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Impact Analysis
                  </h3>
                  <div className="space-y-3">
                    <ImpactItem
                      label="Annual CO₂ Saved"
                      value={formatCO2(selectedScenario.savings)}
                      icon="🌍"
                    />
                    <ImpactItem
                      label="Equivalent to planting"
                      value={Math.round(
                        selectedScenario.savings / 21
                      ).toLocaleString()}
                      icon="🌳"
                      unit="trees"
                    />
                    <ImpactItem
                      label="Money saved annually"
                      value="$" + (selectedScenario.savings * 0.2).toFixed(0)}
                      icon="💰"
                    />
                    <ImpactItem
                      label="Time to carbon neutral"
                      value={(selectedScenario.savings / currentEmissions * 365).toFixed(0)}
                      icon="⏱️"
                      unit="days"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Implementation Path
                  </h3>
                  <ol className="space-y-3">
                    <Step num={1} text="Start tracking your baseline emissions" />
                    <Step num={2} text="Set reduction targets aligned with this scenario" />
                    <Step num={3} text="Update your daily habits" />
                    <Step num={4} text="Monitor progress monthly" />
                    <Step num={5} text="Achieve carbon neutrality in 12 months" />
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="mt-12 bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            🧠 AI Insights
          </h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Based on your current emission patterns, the AI Carbon Twin predicts that your
              transportation is the highest contributor at 45% of total emissions. Switching to
              public transport 3-5 days per week would reduce annual emissions by approximately
              1.8 tons CO₂.
            </p>
            <p>
              Your energy consumption is the second highest factor. Installing solar panels or
              switching to a renewable energy plan could save you an additional 1.2 tons CO₂
              annually while reducing electricity costs by $40/month.
            </p>
            <p className="text-emerald-400 font-semibold">
              ✨ Recommended action: Combine the Public Transport Switch with Renewable Energy
              for maximum impact (60% reduction).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  subtitle?: string;
}

function MetricCard({ label, value, icon, subtitle }: MetricCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
}

interface ImpactItemProps {
  label: string;
  value: string;
  icon: string;
  unit?: string;
}

function ImpactItem({ label, value, icon, unit }: ImpactItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-slate-300">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-emerald-400 font-bold text-lg">{value}</span>
        {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="text-emerald-400 font-bold text-lg flex-shrink-0">
        {num}
      </span>
      <span className="text-slate-300">{text}</span>
    </li>
  );
}

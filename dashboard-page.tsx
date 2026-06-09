// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import DashboardCard from '@/components/dashboard/dashboard-card';
import EmissionChart from '@/components/dashboard/emission-chart';
import RecommendationCard from '@/components/dashboard/recommendation-card';
import { formatCO2, getLevelName } from '@/lib/utils';

interface DashboardData {
  carbonScore: number;
  monthlyTotal: number;
  yearlyTotal: number;
  reduction: number;
  level: number;
  xp: number;
  breakdown: {
    transportation: number;
    energy: number;
    food: number;
    shopping: number;
    waste: number;
  };
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [dashboardRes, recommendationsRes] = await Promise.all([
          apiClient.getDashboard(),
          apiClient.getRecommendations(),
        ]);

        setData(dashboardRes.data);
        setRecommendations(recommendationsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="text-center text-slate-400">No data available yet</div>
      </div>
    );
  }

  const chartData = [
    { name: 'Transportation', value: data.breakdown.transportation },
    { name: 'Energy', value: data.breakdown.energy },
    { name: 'Food', value: data.breakdown.food },
    { name: 'Shopping', value: data.breakdown.shopping },
    { name: 'Waste', value: data.breakdown.waste },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.displayName || 'User'}!
        </h1>
        <p className="text-slate-400">
          Your carbon footprint overview for this month
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Carbon Score"
          value={formatCO2(data.carbonScore)}
          icon="📊"
          trend={data.reduction}
          subtitle="Daily average"
        />
        <DashboardCard
          title="Monthly Total"
          value={formatCO2(data.monthlyTotal)}
          icon="📈"
          trend={data.reduction}
          subtitle="This month"
        />
        <DashboardCard
          title="Yearly Total"
          value={formatCO2(data.yearlyTotal)}
          icon="📉"
          trend={data.reduction}
          subtitle="Projected"
        />
        <DashboardCard
          title="Level"
          value={getLevelName(data.level)}
          icon="🏆"
          stats={{ xp: data.xp, level: data.level }}
          subtitle={`${data.xp} XP`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Emission Breakdown Pie Chart */}
        <div className="lg:col-span-2">
          <EmissionChart data={chartData} />
        </div>

        {/* Category Details */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Emission Breakdown
          </h3>
          <div className="space-y-3">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-emerald-400 font-semibold">
                  {formatCO2(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          AI Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec: any) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors">
          Log Activity
        </button>
        <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors">
          View Full Calculator
        </button>
        <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors">
          See Leaderboard
        </button>
      </div>
    </div>
  );
}

// components/dashboard/dashboard-card.tsx
interface DashboardCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: number;
  subtitle?: string;
  stats?: { xp: number; level: number };
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  stats,
}: DashboardCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
          <span className="text-3xl">{icon}</span>
        </div>
        <div className="mb-2">
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend < 0 ? 'text-emerald-400' : 'text-red-400'}>
              {trend < 0 ? '↓' : '↑'} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

// components/dashboard/emission-chart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface EmissionChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EmissionChart({ data }: EmissionChartProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Emission Sources
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(2)} kg CO₂`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// components/dashboard/recommendation-card.tsx
interface Recommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  difficulty: string;
  category: string;
}

export default function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {recommendation.title}
        </h4>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            difficultyColors[recommendation.difficulty as keyof typeof difficultyColors]
          }`}
        >
          {recommendation.difficulty}
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-3">{recommendation.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Saves: <span className="text-emerald-400 font-semibold">
            {recommendation.estimatedSavings.toFixed(0)} kg CO₂/year
          </span>
        </span>
        <button className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}

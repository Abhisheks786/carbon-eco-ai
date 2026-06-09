'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getLevelName } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  user: {
    name: string;
    avatar?: string;
    city?: string;
  };
  xpPoints: number;
  level: number;
  reductionPercent: number;
  streakDays: number;
  globalRank?: number;
}

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [cityRankings, setCityRankings] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCity, setUserCity] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [globalRes, profileRes] = await Promise.all([
          apiClient.getLeaderboard(50),
          apiClient.getProfile(),
        ]);

        setLeaderboard(globalRes.data);
        setUserCity(profileRes.data.city || '');

        if (profileRes.data.city) {
          const cityRes = await apiClient.getCityRankings(profileRes.data.city);
          setCityRankings(cityRes.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const displayData = activeTab === 'global' ? leaderboard : cityRankings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Community Leaderboard
          </h1>
          <p className="text-slate-400">
            Compete with others and earn sustainability badges
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'global'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌍 Global Rankings
          </button>
          <button
            onClick={() => setActiveTab('city')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'city'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📍 {userCity || 'City'} Rankings
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👥 Friends
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={leaderboard.length}
            icon="👥"
          />
          <StatCard
            label="Active Challenges"
            value={12}
            icon="⚡"
          />
          <StatCard
            label="CO₂ Saved"
            value="125.5k kg"
            icon="🌱"
          />
        </div>

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-700/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      XP Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Reduction
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {displayData.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-700/20 transition-colors ${
                        entry.user.name === user?.displayName
                          ? 'bg-emerald-500/10'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                        #{idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                            {entry.user.avatar || '👤'}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {entry.user.name}
                            </p>
                            {entry.user.city && (
                              <p className="text-xs text-slate-500">
                                {entry.user.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                          {getLevelName(entry.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {entry.xpPoints.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-semibold">
                          {entry.reductionPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1">
                          <span className="text-orange-400">🔥</span>
                          <span className="text-white font-semibold">
                            {entry.streakDays}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Challenges Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            🎯 Active Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ChallengeCard
              name="No-Car Day"
              description="Don't use a car for 24 hours"
              reward="250 XP"
              participants={1234}
              icon="🚴"
            />
            <ChallengeCard
              name="Energy Saver"
              description="Reduce electricity by 15%"
              reward="300 XP"
              participants={892}
              icon="⚡"
            />
            <ChallengeCard
              name="Meat-Free Monday"
              description="Go vegetarian for one day"
              reward="200 XP"
              participants={2156}
              icon="🥗"
            />
            <ChallengeCard
              name="Plastic-Free Week"
              description="Zero single-use plastics"
              reward="500 XP"
              participants={456}
              icon="♻️"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  name: string;
  description: string;
  reward: string;
  participants: number;
  icon: string;
}

function ChallengeCard({
  name,
  description,
  reward,
  participants,
  icon,
}: ChallengeCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/50 transition-all group cursor-pointer">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
        {name}
      </h3>
      <p className="text-sm text-slate-400 mb-3">{description}</p>
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <span className="text-xs text-emerald-400 font-semibold">{reward}</span>
        <span className="text-xs text-slate-500">{participants} joined</span>
      </div>
    </div>
  );
}

import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await (window as any).__getAuthToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Auth
  signup: (email: string, password: string, name: string) =>
    api.post('/api/auth/signup', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),

  // Calculator
  calculateFootprint: (data: any) =>
    api.post('/api/footprint/calculate', data),
  getHistory: () => api.get('/api/footprint/history'),
  getMonthlyData: (year: number, month: number) =>
    api.get(`/api/footprint/monthly/${year}/${month}`),

  // Dashboard
  getDashboard: () => api.get('/api/dashboard/overview'),
  getBreakdown: () => api.get('/api/dashboard/breakdown'),
  getRecommendations: () => api.get('/api/dashboard/recommendations'),

  // Community
  getLeaderboard: (limit = 50) =>
    api.get(`/api/community/leaderboard?limit=${limit}`),
  getCityRankings: (city: string) =>
    api.get(`/api/community/city-rankings/${city}`),
  getFriendScores: () => api.get('/api/community/friends'),

  // Achievements
  getUserAchievements: () => api.get('/api/achievements/user'),
  claimAchievement: (id: string) =>
    api.post(`/api/achievements/claim/${id}`),

  // Offsets
  createOffset: (data: any) =>
    api.post('/api/offsets/create', data),
  getOffsets: () => api.get('/api/offsets/my-offsets'),
};

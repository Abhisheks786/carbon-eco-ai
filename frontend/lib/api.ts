import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await (window as any).__getAuthToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; code?: string }>) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.error;
    const code = error.response?.data?.code;

    if (serverMessage) {
      error.message = serverMessage;
    } else if (status === 404) {
      error.message =
        'Could not reach the authentication service. Make sure the backend is running on port 5000.';
    } else if (status === 401) {
      error.message = serverMessage || 'Invalid email or password.';
    } else if (!error.response) {
      error.message =
        'Unable to connect to the server. Check your connection and try again.';
    }

    (error as any).code = code;
    return Promise.reject(error);
  }
);

export const apiClient = {
  signup: (data: {
    email: string;
    password?: string;
    name: string;
    firebaseId?: string;
    idToken?: string;
  }) => api.post('/api/auth/signup', data),

  login: (email: string, password: string, idToken?: string) =>
    api.post('/api/auth/login', { email, password, idToken }),

  syncUser: (idToken: string, name?: string) =>
    api.post('/api/auth/sync', { idToken, name }),

  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    api.put('/api/auth/profile', data),

  calculateFootprint: (data: Record<string, unknown>) =>
    api.post('/api/footprint/calculate', data),
  getHistory: () => api.get('/api/footprint/history'),
  getMonthlyData: (year: number, month: number) =>
    api.get(`/api/footprint/monthly/${year}/${month}`),

  getDashboard: () => api.get('/api/dashboard/overview'),
  getBreakdown: () => api.get('/api/dashboard/breakdown'),
  getRecommendations: () => api.get('/api/dashboard/recommendations'),

  getLeaderboard: (limit = 50) =>
    api.get(`/api/community/leaderboard?limit=${limit}`),
  getCityRankings: (city: string) =>
    api.get(`/api/community/city-rankings/${city}`),
  getFriendScores: () => api.get('/api/community/friends'),

  getUserAchievements: () => api.get('/api/achievements/user'),
  claimAchievement: (id: string) => api.post(`/api/achievements/claim/${id}`),

  createOffset: (data: Record<string, unknown>) =>
    api.post('/api/offsets/create', data),
  getOffsets: () => api.get('/api/offsets/my-offsets'),
};

export { API_BASE };

import axios from 'axios';
import { normalizeUser } from '../utils/userUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.accessToken) {
      const normalizedUser = normalizeUser(response.data.user);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return { ...response.data, user: normalizedUser };
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      const normalizedUser = normalizeUser(response.data.user);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return { ...response.data, user: normalizedUser };
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    const normalizedUser = normalizeUser(response.data);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  },

  updateProfile: async (updates) => {
    const response = await api.put('/auth/me', updates);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (context = null) => {
    const params = context ? { context } : {};
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/tasks/today');
    return response.data;
  },

  getWeek: async () => {
    const response = await api.get('/tasks/week');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.post(`/tasks/${id}/complete`);
    return response.data;
  },

  uncomplete: async (id) => {
    const response = await api.post(`/tasks/${id}/uncomplete`);
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  getStreak: async () => {
    const response = await api.get('/stats/streak');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },

  checkAchievements: async () => {
    const response = await api.post('/achievements/check');
    return response.data;
  },
};

// Calendar API (to be implemented)
export const calendarAPI = {
  connect: async (provider, authCode) => {
    const response = await api.post('/calendar/connect', { provider, authCode });
    return response.data;
  },

  disconnect: async (connectionId) => {
    const response = await api.delete(`/calendar/${connectionId}`);
    return response.data;
  },

  sync: async (connectionId) => {
    const response = await api.post(`/calendar/${connectionId}/sync`);
    return response.data;
  },

  getConnections: async () => {
    const response = await api.get('/calendar/connections');
    return response.data;
  },
};

export default api;


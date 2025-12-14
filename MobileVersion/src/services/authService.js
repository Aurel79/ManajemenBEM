import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success) {
        // Simpan token dan user info ke AsyncStorage
        await AsyncStorage.setItem('access_token', response.data.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      // Hapus storage meskipun ada error
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isLoggedIn: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  getUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActivityLogs: async (page = 1, type = null) => {
    try {
      let url = `/activity-logs?page=${page}&per_page=20`;
      if (type) {
        url += `&type=${type}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActivityLogTypes: async () => {
    try {
      const response = await api.get('/activity-logs/types');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Roles CRUD
  getRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRoleDetail: async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPermissions: async () => {
    try {
      const response = await api.get('/roles/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      const response = await api.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await api.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Users CRUD
  getUsers: async (page = 1, search = '') => {
    try {
      let url = `/users?page=${page}&per_page=20`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserDetail: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMinistries: async () => {
    try {
      const response = await api.get('/ministries');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMinistryDetail: async (id) => {
    try {
      const response = await api.get(`/ministries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createMinistry: async (data) => {
    try {
      const response = await api.post('/ministries', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateMinistry: async (id, data) => {
    try {
      const response = await api.put(`/ministries/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteMinistry: async (id) => {
    try {
      const response = await api.delete(`/ministries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Proposals CRUD
  getProposals: async (page = 1, search = '') => {
    try {
      let url = `/proposals?page=${page}&per_page=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProposalDetail: async (id) => {
    try {
      const response = await api.get(`/proposals/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProposal: async (data) => {
    try {
      const response = await api.post('/proposals', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProposal: async (id, data) => {
    try {
      const response = await api.put(`/proposals/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProposal: async (id) => {
    try {
      const response = await api.delete(`/proposals/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProposalStatuses: async () => {
    try {
      const response = await api.get('/proposals/statuses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProposalStatus: async (id, statusId, keterangan = null) => {
    try {
      const response = await api.patch(`/proposals/${id}/status`, {
        status_id: statusId,
        keterangan
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Program Kerja CRUD
  getProgramKerja: async (page = 1, search = '', ministryId = null) => {
    try {
      let url = `/program-kerja?page=${page}&per_page=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (ministryId) url += `&ministry_id=${ministryId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProgramKerjaDetail: async (id) => {
    try {
      const response = await api.get(`/program-kerja/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProgramKerjaStatuses: async () => {
    try {
      const response = await api.get('/program-kerja/statuses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProgramKerja: async (data) => {
    try {
      const response = await api.post('/program-kerja', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProgramKerja: async (id, data) => {
    try {
      const response = await api.put(`/program-kerja/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProgramKerja: async (id) => {
    try {
      const response = await api.delete(`/program-kerja/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStatuses: async () => {
    try {
      const response = await api.get('/statuses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Announcements
  getAnnouncements: async (page = 1) => {
    try {
      const response = await api.get(`/announcements?page=${page}&per_page=20`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAnnouncementUnreadCount: async () => {
    try {
      const response = await api.get('/announcements/unread-count');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createAnnouncement: async (data) => {
    try {
      const response = await api.post('/announcements', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Device Token
  saveDeviceToken: async (token, platform) => {
    try {
      const response = await api.post('/device-token', { token, platform });
      return response.data;
    } catch (error) {
      // Don't throw error to avoid blocking app flow
      console.log('Error saving device token:', error);
      return null;
    }
  },
};

export default api;


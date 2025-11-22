import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
};

export const treeService = {
  getTrees: async (params = {}) => {
    const response = await api.get('/trees/', { params });
    return response.data;
  },

  getTree: async (id) => {
    const response = await api.get(`/trees/${id}/`);
    return response.data;
  },

  getMapData: async () => {
    const response = await api.get('/trees/map_data/');
    return response.data;
  },

  adoptTree: async (treeId, adoptionData) => {
    const response = await api.post(`/trees/${treeId}/adopt_tree/`, adoptionData);
    return response.data;
  },
};

export const adoptionService = {
  getMyAdoptions: async () => {
    const response = await api.get('/adoptions/my_adoptions/');
    return response.data;
  },

  getAdoptions: async (params = {}) => {
    const response = await api.get('/adoptions/', { params });
    return response.data;
  },

  getAdoptionRequests: async (params = {}) => {
    const response = await api.get('/trees/adoption-requests/', { params });
    return response.data;
  },

  approveAdoption: async (requestId) => {
    const response = await api.post(`/trees/adoption-requests/${requestId}/approve/`);
    return response.data;
  },

  rejectAdoption: async (requestId, reason) => {
    const response = await api.post(`/trees/adoption-requests/${requestId}/reject/`, { reason });
    return response.data;
  },
};

export const reportService = {
  createReport: async (reportData) => {
    const formData = new FormData();
    Object.keys(reportData).forEach((key) => {
      if (reportData[key] !== null && reportData[key] !== undefined) {
        formData.append(key, reportData[key]);
      }
    });
    const response = await api.post('/reports/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  analyzeReport: async (reportId) => {
    const response = await api.post(`/reports/${reportId}/analyze/`);
    return response.data;
  },

  verifyReport: async (reportId, notes) => {
    const response = await api.post(`/reports/${reportId}/verify/`, { notes });
    return response.data;
  },

  getReports: async (params = {}) => {
    const response = await api.get('/reports/', { params });
    return response.data;
  },

  getMyReports: async () => {
    const response = await api.get('/reports/my_reports/');
    return response.data;
  },
};

export const speciesService = {
  getSpecies: async (params = {}) => {
    const response = await api.get('/species/', { params });
    return response.data;
  },

  getSpeciesDetail: async (id) => {
    const response = await api.get(`/species/${id}/`);
    return response.data;
  },
};

export const alertService = {
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts/', { params });
    return response.data;
  },

  resolveAlert: async (alertId) => {
    const response = await api.post(`/alerts/${alertId}/resolve/`);
    return response.data;
  },
};

export const incidentService = {
  getIncidents: async (params = {}) => {
    const response = await api.get('/incidents/', { params });
    return response.data;
  },

  getMyIncidents: async () => {
    const response = await api.get('/incidents/my_incidents/');
    return response.data;
  },

  assignIncident: async (incidentId) => {
    const response = await api.post(`/incidents/${incidentId}/assign/`);
    return response.data;
  },

  resolveIncident: async (incidentId, notes) => {
    const response = await api.post(`/incidents/${incidentId}/resolve/`, { notes });
    return response.data;
  },
};

export const aiService = {
  analyzeImage: async (reportId) => {
    const response = await api.post(`/reports/${reportId}/analyze_ai/`);
    return response.data;
  },

  analyzePlantHealth: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post('/ai/analyze-plant/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default api;

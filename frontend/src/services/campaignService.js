import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Campaign Services
export const campaignService = {
  // Get all campaigns
  getAllCampaigns: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/campaigns/?${params}`);
    return response.data;
  },

  // Get single campaign
  getCampaign: async (slug) => {
    const response = await axios.get(`${API_URL}/campaigns/${slug}/`);
    return response.data;
  },

  // Create campaign
  createCampaign: async (campaignData) => {
    const response = await axios.post(
      `${API_URL}/campaigns/`,
      campaignData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Join campaign
  joinCampaign: async (slug, participantData) => {
    const response = await axios.post(
      `${API_URL}/campaigns/${slug}/join/`,
      participantData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Contribute to campaign
  contribute: async (slug, contributionData) => {
    const response = await axios.post(
      `${API_URL}/campaigns/${slug}/contribute/`,
      contributionData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get campaign participants
  getParticipants: async (slug, type = null) => {
    const url = type 
      ? `${API_URL}/campaigns/${slug}/participants/?type=${type}`
      : `${API_URL}/campaigns/${slug}/participants/`;
    const response = await axios.get(url);
    return response.data;
  },

  // Get campaign contributions
  getContributions: async (slug) => {
    const response = await axios.get(`${API_URL}/campaigns/${slug}/contributions/`);
    return response.data;
  },

  // Add update to campaign
  addUpdate: async (slug, updateData) => {
    const response = await axios.post(
      `${API_URL}/campaigns/${slug}/add_update/`,
      updateData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get user's campaigns
  getMyCampaigns: async () => {
    const response = await axios.get(
      `${API_URL}/campaigns/my_campaigns/`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get campaign stats
  getStats: async () => {
    const response = await axios.get(`${API_URL}/campaigns/stats/`);
    return response.data;
  },

  // Cast vote
  castVote: async (voteId, option) => {
    const response = await axios.post(
      `${API_URL}/votes/${voteId}/cast_vote/`,
      { option },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Like update
  likeUpdate: async (updateId) => {
    const response = await axios.post(
      `${API_URL}/updates/${updateId}/like/`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default campaignService;

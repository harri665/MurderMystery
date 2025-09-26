import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contact API
export const contactAPI = {
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  }
};

// Messages API
export const messageAPI = {
  getAll: async () => {
    const response = await api.get('/messages');
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
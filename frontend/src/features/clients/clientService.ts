import axios from 'axios';
import { Client, ClientFilter } from './clientTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ message: 'No response from server. Please check your connection.' });
    } else {
      // Something happened in setting up the request
      return Promise.reject({ message: error.message });
    }
  }
);

// Client API service
const clientService = {
  // Get all clients with pagination and filtering
  getClients: async (filters: ClientFilter = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/clients?${params.toString()}`);
    return response.data;
  },

  // Search clients by query
  searchClients: async (query: string) => {
    const response = await api.get(`/clients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get single client by ID
  getClient: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Create a new client
  createClient: async (clientData: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Update an existing client
  updateClient: async (id: string, clientData: Partial<Omit<Client, '_id' | 'createdAt' | 'updatedAt'>>) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete a client
  deleteClient: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

export default clientService;

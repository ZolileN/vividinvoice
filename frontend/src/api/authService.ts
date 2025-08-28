import api from './client';
import { useAsync } from '../hooks/useAsync';

export const useLogin = () => {
  return useAsync(async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  });
};

export const useRegister = () => {
  return useAsync(async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    companyName?: string; 
    vatNumber?: string 
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  });
};

export const useGetMe = () => {
    return useAsync(async () => {
      const response = await api.get('/auth/me');
      return response.data;
    });
  };

export const useLogout = () => {
    return useAsync(async () => {
      const response = await api.get('/auth/logout');
      return response.data;
    });
  };
// Add more API calls as needed
import api from '../../api/axios';

type RegisterData = {
  name: string;
  email: string;
  password: string;
  companyName: string;
  vatNumber: string;
};

type LoginData = {
  email: string;
  password: string;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  companyName: string;
  vatNumber: string;
  role?: string;
};

export const authService = {
  // Register a new user
  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Login user
  login: async (credentials: LoginData) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response;
  },

  // Get current user profile
  getProfile: async (): Promise<UserData> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<UserData>) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/updatepassword', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },
};

export default authService;

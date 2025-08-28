// Token key for localStorage
const TOKEN_KEY = 'vividinvoice_token';

// Get token from localStorage
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Set token in localStorage
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
};

// Remove token from localStorage
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  vatNumber: string;
  role?: string;
}

// Get user data from localStorage
export const getUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Set user data in localStorage
export const setUser = (user: User): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error setting user in localStorage:', error);
  }
};

// Remove user data from localStorage
export const removeUser = (): void => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Clear all auth data
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user?.role === role;
};

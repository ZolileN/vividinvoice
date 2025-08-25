// Token key for localStorage
const TOKEN_KEY = 'vividinvoice_token';

export type User = {
  id: string;
  name: string;
  email: string;
  companyName: string;
  vatNumber: string;
  role?: string;
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Set user data in localStorage
export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user data from localStorage
export const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user data from localStorage
export const removeUser = (): void => {
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Clear all auth data
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user?.role === role;
};

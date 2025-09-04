import React, { useEffect } from 'react';
import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet, BrowserRouter } from 'react-router-dom';
import ConfigProvider from 'antd/es/config-provider';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setCredentials } from './features/auth/authSlice';
import { getToken } from './utils/auth';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Client Pages
import ClientsPage from './features/clients/pages/ClientsPage';
import ClientForm from './features/clients/components/ClientForm';
import ClientDetailPage from './features/clients/pages/ClientDetailPage';
import InvoiceRoutes from './features/invoices/routes/InvoiceRoutes';
import ClientRoutes from './features/clients/routes/ClientRoutes';
import SettingsPage from './pages/SettingsPage';


// Component to handle authentication and routing
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userJson = localStorage.getItem('user');
          const user = userJson ? JSON.parse(userJson) : null;
          if (user) {
            dispatch(setCredentials({ user, token }));
          } else {
            // If user data is invalid, clear the token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  if (!initialized) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (isAuthenticated && ['/login', '/register', '/'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={!isAuthenticated ? <AuthLayout><Outlet /></AuthLayout> : <Navigate to="/dashboard" replace />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={
        isAuthenticated ? 
          <MainLayout><Outlet /></MainLayout> : 
          <Navigate to="/login" state={{ from: location }} replace />
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Client Routes */}
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />
        
        {/* Invoice Routes */}
        <Route path="/invoices/*" element={<InvoiceRoutes />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Catch all other routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback for unauthenticated users */}
      <Route path="*" element={
        isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/login" state={{ from: location }} replace />
      } />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <ConfigProvider>
            <AppRoutes />
          </ConfigProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;

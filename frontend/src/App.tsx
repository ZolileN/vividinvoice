import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setCredentials } from './features/auth/authSlice';
import { getToken } from './utils/auth';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Client Pages
import ClientsPage from './features/clients/pages/ClientsPage';
import ClientForm from './features/clients/components/ClientForm';
import ClientDetailPage from './features/clients/pages/ClientDetailPage';

// Initialize theme
const { defaultAlgorithm } = theme; 

// Component to handle authentication and routing
const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Check for existing token on app load
  useEffect(() => {
    const token = getToken();
    if (token) {
      // In a real app, you would validate the token with the server
      // and fetch the user's data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      dispatch(setCredentials({ user, token }));
    }
  }, [dispatch]);

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && ['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !['/login', '/register', '/'].includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        element={
          <AuthLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </AuthLayout>
        }
      />

      {/* Protected Routes */}
      <Route element={<MainLayout><Outlet /></MainLayout>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Client Management Routes */}
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />
        
        {/* Add more protected routes here */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
          },
          components: {
            Layout: {
              headerBg: '#fff',
              headerHeight: 64,
              headerPadding: '0 24px',
              headerColor: 'rgba(0, 0, 0, 0.85)',
            },
          },
        }}
      >
        <AntdApp>
          <Router>
            <AppRoutes />
          </Router>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;

import { NavigateOptions, To, useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goTo = (to: To, options?: NavigateOptions) => {
    navigate(to, options);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return {
    goTo,
    goBack,
    goForward,
  };
};

// Navigation paths
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  CLIENTS: '/clients',
  CLIENT_DETAIL: (id: string | number) => `/clients/${id}`,
  CLIENT_EDIT: (id: string | number) => `/clients/${id}/edit`,
  NEW_CLIENT: '/clients/new',
  INVOICES: '/invoices',
  INVOICE_DETAIL: (id: string | number) => `/invoices/${id}`,
  NEW_INVOICE: '/invoices/new',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

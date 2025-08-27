import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import invoiceReducer from '../features/invoices/invoiceSlice';
import clientReducer, { ClientState } from '../features/clients/clientSlice';

// Define the root state type
export interface RootState {
  auth: any; // Replace with your auth state type
  invoices: any; // Replace with your invoices state type
  clients: ClientState;
}

const rootReducer = combineReducers({
  auth: authReducer,
  invoices: invoiceReducer,
  clients: clientReducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
          ignoredPaths: ['auth.user'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = setupStore();

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

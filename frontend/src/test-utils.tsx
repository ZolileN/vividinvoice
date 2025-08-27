import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { RootState, store } from './store/store';
import clientReducer from './features/clients/clientSlice';
import { PropsWithChildren } from 'react';

// Add this type definition
type PreloadedState<S> = S;

// Define a custom type that extends RenderOptions
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  route?: string;
  routerProps?: Omit<MemoryRouterProps, 'children'>;
}

// Define the initial state
const getDefaultState = () => ({
    clients: {
      clients: [],
      currentClient: null,
      loading: false,
      error: null,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      filters: {}
    },
    auth: {},
    invoices: {}
  });
  
  // Create a custom render function that includes the Redux Provider
  const renderWithProviders = (
    ui: ReactElement,
    {
      preloadedState = getDefaultState(),
      route = '/',
      routerProps = {},
      ...renderOptions
    }: ExtendedRenderOptions = {}
  ) => {
    const store = configureStore({
      reducer: {
        clients: clientReducer,
        auth: (state = {}) => state,
        invoices: (state = {}) => state,
      },
      preloadedState,
    });

  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]} {...routerProps}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
// Override the render method with our custom render
export { renderWithProviders as render };

// Helper function to create a mock store for testing
// Move createTestStore outside
export const createTestStore = (preloadedState: PreloadedState<RootState> = getDefaultState()) => {
    return configureStore({
      reducer: {
        clients: clientReducer,
        auth: (state = {}) => state,
        invoices: (state = {}) => state,
      },
      preloadedState,
    });
  };

// Helper type for the Redux store type
export type AppStore = ReturnType<typeof createTestStore>;


// Helper type for the app dispatch
export type AppDispatch = AppStore['dispatch'];

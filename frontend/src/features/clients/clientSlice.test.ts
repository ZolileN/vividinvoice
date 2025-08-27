import { configureStore, combineReducers, ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction, Reducer } from '@reduxjs/toolkit';
import clientReducer, { 
  fetchClients, 
  getClient, 
  createClient, 
  updateClient, 
  deleteClient, 
  clearCurrentClient, 
  setFilters, 
  resetFilters,
  ClientState,
  initialState
} from './clientSlice';
import { Client } from './clientTypes';
import clientService from './clientService';
import { RootState } from '../../store/store';

// Mock the clientService
jest.mock('./clientService');

// Create a typed root reducer
const rootReducer = combineReducers({
  clients: clientReducer as Reducer<ClientState, AnyAction>
});

// Helper function to create a test store with the client reducer
const createTestStore = (preloadedState?: Partial<RootState>) => {
    return configureStore({
      reducer: {
        clients: clientReducer,
        // Add other reducers that are in your root state
        auth: () => ({}),
        invoices: () => ({}),
      },
      preloadedState: {
        clients: {
          ...initialState,
          ...(preloadedState?.clients || {})
        },
        // Initialize other slices with empty state if needed
        auth: preloadedState?.auth || {},
        invoices: preloadedState?.invoices || {},
      } as RootState
    });
  };

// Define the store type
type AppStore = ReturnType<typeof createTestStore> & {
  getState: () => RootState;
  dispatch: AppDispatch;
};

type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Initialize the store variable
let store: AppStore;

describe('clientSlice', () => {
  const mockClient: Client = {
    _id: '1',
    user: 'user1',
    name: 'Test Client',
    email: 'test@example.com',
    phone: '1234567890',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  // Reset the store before each test
  beforeEach(() => {
    store = createTestStore({
      clients: {
        ...initialState,
        clients: [],
        currentClient: null,
        loading: false,
        error: null,
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0,
        },
        filters: {},
      }
    });
    jest.clearAllMocks();
  });

  describe('fetchClients', () => {
    it('should handle fetching clients', async () => {
      const mockClients = {
        data: [mockClient], 
        pagination: { current: 1, pageSize: 10, total: 1 }
      };
      
      (clientService.getClients as jest.Mock).mockResolvedValueOnce(mockClients);
      
      const result = await store.dispatch(fetchClients({}) as any);
      
      expect(result.type).toBe('clients/fetchClients/fulfilled');
      
      const state = store.getState().clients;
      expect(state.clients).toEqual(mockClients.data);
      expect(state.pagination).toEqual(mockClients.pagination);
      expect(state.loading).toBe(false);
    });
  });

  describe('getClient', () => {
    it('should handle getting a single client', async () => {
      (clientService.getClient as jest.Mock).mockResolvedValueOnce(mockClient);
      
      await store.dispatch(getClient('1'));
      
      const state = store.getState().clients;
      expect(state.currentClient).toEqual(mockClient);
      expect(state.loading).toBe(false);
    });
  });

  describe('createClient', () => {
    it('should handle creating a client', async () => {
      const newClient = {
        name: 'New Client',
        email: 'new@example.com',
        phone: '0987654321',
        user: 'user1'
      };
      
      (clientService.createClient as jest.Mock).mockResolvedValueOnce(mockClient);
      
      await store.dispatch(createClient(newClient));
      
      const state = store.getState().clients;
      expect(state.clients).toContainEqual(mockClient);
      expect(state.loading).toBe(false);
    });
  });

  describe('updateClient', () => {
    it('should handle updating a client', async () => {
      const updatedClient = { ...mockClient, name: 'Updated Client' };
      (clientService.updateClient as jest.Mock).mockResolvedValueOnce(updatedClient);
      
      await store.dispatch(updateClient({ id: '1', clientData: { name: 'Updated Client' } }));
      
      const state = store.getState().clients;
      expect(state.currentClient).toEqual(updatedClient);
      expect(state.loading).toBe(false);
    });
  });

  describe('deleteClient', () => {
    it('should handle deleting a client', async () => {
      // First add a client to the state
      store = createTestStore({
        clients: {
          ...initialState,
          clients: [mockClient]
        }
      });
      
      (clientService.deleteClient as jest.Mock).mockResolvedValueOnce({});
      
      await store.dispatch(deleteClient('1'));
      
      const state = store.getState().clients;
      expect(state.clients).toHaveLength(0);
      expect(state.loading).toBe(false);
    });
  });

  describe('reducers', () => {
    it('should handle clearCurrentClient', () => {
      const state = clientReducer(
        { ...initialState, currentClient: mockClient },
        clearCurrentClient()
      );
      expect(state.currentClient).toBeNull();
    });

    it('should handle setFilters', () => {
      const filters = { search: 'test', sortBy: 'name' };
      const state = clientReducer(initialState, setFilters(filters));
      expect(state.filters).toEqual(filters);
    });

    it('should handle resetFilters', () => {
      const state = clientReducer(
        { ...initialState, filters: { search: 'test' } },
        resetFilters()
      );
      expect(state.filters).toEqual({});
    });
  });
});

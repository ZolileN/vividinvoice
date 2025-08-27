import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import clientService from './clientService';
import { RootState } from '../../store/store';
import { Client, ClientState, ClientFilter } from './clientTypes';

export const initialState: ClientState = {
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
};

// Async thunks
// Define the response type for fetchClients
type FetchClientsResponse = {
  data: Client[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
};

export const fetchClients = createAsyncThunk<FetchClientsResponse, any, { state: RootState }>(
  'clients/fetchClients',
  async (params: any, { rejectWithValue, getState }) => {
    try {
      const response = await clientService.getClients(params);
      return {
        data: response.data,
        pagination: {
          current: params?.page || 1,
          pageSize: params?.limit || 10,
          total: response.pagination?.total || 0,
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const searchClients = createAsyncThunk<Client[], string, { state: RootState }>(
  'clients/searchClients',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await clientService.searchClients(query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getClient = createAsyncThunk<Client, string, { state: RootState }>(
  'clients/getClient',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await clientService.getClient(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client');
    }
  }
);

export const createClient = createAsyncThunk<Client, Omit<Client, '_id' | 'createdAt' | 'updatedAt'>, { state: RootState }>(
  'clients/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await clientService.createClient(clientData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create client');
    }
  }
);

export const updateClient = createAsyncThunk<Client, { id: string; clientData: Partial<Client> }, { state: RootState }>(
  'clients/updateClient',
  async ({ id, clientData }, { rejectWithValue }) => {
    try {
      const response = await clientService.updateClient(id, clientData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update client');
    }
  }
);

export const deleteClient = createAsyncThunk<string, string, { state: RootState }>(
  'clients/deleteClient',
  async (id: string, { rejectWithValue }) => {
    try {
      await clientService.deleteClient(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    setFilters: (state, action: PayloadAction<ClientFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    // fetchClients
    builder.addCase(fetchClients.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchClients.fulfilled, (state, action: PayloadAction<FetchClientsResponse>) => {
      state.loading = false;
      state.clients = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchClients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // searchClients
    builder.addCase(searchClients.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
      state.loading = false;
      state.clients = action.payload;
    });
    builder.addCase(searchClients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // getClient
    builder.addCase(getClient.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getClient.fulfilled, (state, action: PayloadAction<Client>) => {
      state.loading = false;
      state.currentClient = action.payload;
    });
    builder.addCase(getClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createClient
    builder.addCase(createClient.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createClient.fulfilled, (state, action: PayloadAction<Client>) => {
      state.loading = false;
      state.clients.unshift(action.payload);
      state.pagination.total += 1;
    });
    builder.addCase(createClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateClient
    builder.addCase(updateClient.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateClient.fulfilled, (state, action: PayloadAction<Client>) => {
      state.loading = false;
      const index = state.clients.findIndex(client => client._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
      if (state.currentClient?._id === action.payload._id) {
        state.currentClient = action.payload;
      }
    });
    builder.addCase(updateClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // deleteClient
    builder.addCase(deleteClient.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteClient.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.clients = state.clients.filter(client => client._id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentClient?._id === action.payload) {
        state.currentClient = null;
      }
    });
    builder.addCase(deleteClient.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Base selectors
const selectClientsState = (state: RootState) => state.clients;

export const selectAllClients = (state: RootState) => selectClientsState(state).clients;
export const selectCurrentClient = (state: RootState) => selectClientsState(state).currentClient;
export const selectClientLoading = (state: RootState) => selectClientsState(state).loading;
export const selectClientError = (state: RootState) => selectClientsState(state).error;
export const selectClientPagination = (state: RootState) => selectClientsState(state).pagination;
export const selectClientFilters = (state: RootState) => selectClientsState(state).filters;

// Memoized selectors
export const selectClientById = createSelector(
    [selectAllClients, (state: RootState, clientId: string) => clientId],
    (clients: Client[], clientId: string) => clients.find((client: Client) => client._id === clientId)
  );
  export const selectFilteredClients = createSelector(
    [selectAllClients, selectClientFilters],
    (clients: Client[], filters: ClientFilter) => {
      if (!filters.search) return clients;
      
      const searchLower = filters.search.toLowerCase();
      return clients.filter((client: Client) => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
        (client.vatNumber && client.vatNumber.toLowerCase().includes(searchLower))
      );
    }
  );

// Actions
export type { ClientState } from './clientTypes';
export const { clearCurrentClient, setFilters, resetFilters } = clientSlice.actions;

export default clientSlice.reducer;

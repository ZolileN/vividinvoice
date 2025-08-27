import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice, getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, sendInvoiceEmail as sendEmail } from './invoiceService';
import { RootState } from '../../store/store';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  status: 'idle',
  error: null,
  total: 0,
  totalPages: 1,
  currentPage: 1,
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const data = await getInvoices(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoice = createAsyncThunk(
  'invoices/fetchInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await getInvoice(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

export const addInvoice = createAsyncThunk(
  'invoices/addInvoice',
  async (invoiceData: Omit<Invoice, '_id'>, { rejectWithValue }) => {
    try {
      const data = await createInvoice(invoiceData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const editInvoice = createAsyncThunk(
  'invoices/editInvoice',
  async ({ id, invoiceData }: { id: string; invoiceData: Partial<Invoice> }, { rejectWithValue }) => {
    try {
      const data = await updateInvoice(id, invoiceData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const removeInvoice = createAsyncThunk(
  'invoices/removeInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteInvoice(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete invoice');
    }
  }
);

export const sendInvoiceEmail = createAsyncThunk(
  'invoices/sendEmail',
  async ({ id, emailData }: { id: string; emailData: { to: string; subject?: string; message?: string } }, { rejectWithValue }) => {
    try {
      const data = await sendEmail(id, emailData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invoice email');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    resetCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoices = action.payload.data;
        state.total = action.payload.pagination?.total || 0;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Fetch Single Invoice
      .addCase(fetchInvoice.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentInvoice = action.payload.data;
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Add Invoice
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload.data);
        state.status = 'succeeded';
      })
      
      // Update Invoice
      .addCase(editInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice._id === action.payload.data._id);
        if (index !== -1) {
          state.invoices[index] = action.payload.data;
        }
        state.currentInvoice = action.payload.data;
        state.status = 'succeeded';
      })
      
      // Delete Invoice
      .addCase(removeInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(invoice => invoice._id !== action.payload);
        state.status = 'succeeded';
      })
      
      // Send Invoice Email
      .addCase(sendInvoiceEmail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendInvoiceEmail.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(sendInvoiceEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllInvoices = (state: RootState) => state.invoices.invoices;
export const selectCurrentInvoice = (state: RootState) => state.invoices.currentInvoice;
export const selectInvoiceStatus = (state: RootState) => state.invoices.status;
export const selectInvoiceError = (state: RootState) => state.invoices.error;
export const selectInvoicePagination = (state: RootState) => ({
  total: state.invoices.total,
  totalPages: state.invoices.totalPages,
  currentPage: state.invoices.currentPage,
});

export const { resetCurrentInvoice, setCurrentPage } = invoiceSlice.actions;

export default invoiceSlice.reducer;

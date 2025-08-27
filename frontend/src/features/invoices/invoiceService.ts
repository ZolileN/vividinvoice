import api from '../../api/axios';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  isVATInclusive: boolean;
  total: number;
  vatAmount: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  client: string; // Client ID
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vatTotal: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms?: number;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all invoices
export const getInvoices = async (params = {}) => {
  const response = await api.get('/invoices', { params });
  return response.data;
};

// Get single invoice
export const getInvoice = async (id: string) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

// Create new invoice
export const createInvoice = async (invoiceData: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post('/invoices', invoiceData);
  return response.data;
};

// Update invoice
export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
  const response = await api.put(`/invoices/${id}`, invoiceData);
  return response.data;
};

// Delete invoice
export const deleteInvoice = async (id: string) => {
  await api.delete(`/invoices/${id}`);
};

// Generate invoice PDF
export const generateInvoicePDF = async (id: string) => {
  const response = await api.get(`/invoices/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

// Send invoice via email
export const sendInvoiceEmail = async (id: string, emailData: { to: string; subject?: string; message?: string }) => {
  const response = await api.post(`/invoices/${id}/send`, emailData);
  return response.data;
};

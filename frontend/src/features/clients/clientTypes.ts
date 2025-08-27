export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Client {
  _id: string;
  user: string;
  name: string;
  email: string;
  phone?: string;
  vatNumber?: string;
  registrationNumber?: string;
  address?: Address;
  paymentTerms?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: ClientFilter;
}

export interface ClientFilter {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientFormData extends Omit<Client, '_id' | 'createdAt' | 'updatedAt' | 'user'> {
  name: string;
  email: string;
  phone?: string;
  vatNumber?: string;
  registrationNumber?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentTerms?: number;
  notes?: string;
}

export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  clientsByLocation: Array<{
    location: string;
    count: number;
  }>;
  recentClients: Client[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

import { useEffect } from 'react';
import { useAppDispatch } from '../../../store/store';
import { useAppSelector } from '../../../store/hooks';
import {
  fetchClients,
  searchClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  selectAllClients,
  selectCurrentClient,
  selectClientLoading,
  selectClientError,
  selectClientPagination,
  selectClientFilters,
  selectClientById as selectClientByIdFromSlice,
  selectFilteredClients,
  clearCurrentClient,
  setFilters,
  resetFilters,
} from '../clientSlice';
import { Client, ClientFormData, ClientFilter } from '../clientTypes';

export const useClients = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const clients = useAppSelector(selectAllClients);
  const currentClient = useAppSelector(selectCurrentClient);
  const loading = useAppSelector(selectClientLoading);
  const error = useAppSelector(selectClientError);
  const pagination = useAppSelector(selectClientPagination);
  const filters = useAppSelector(selectClientFilters);
  const filteredClients = useAppSelector(selectFilteredClients);

  // Client operations
  const getClients = async (params?: any) => {
    return dispatch(fetchClients(params || {})).unwrap();
  };

  const search = async (query: string) => {
    return dispatch(searchClients(query)).unwrap();
  };

  const getClientById = (id: string) => {
    return clients.find((client: Client) => client._id === id) || null;
  };

  const fetchClient = async (id: string) => {
    return dispatch(getClient(id)).unwrap();
  };

  const addClient = async (clientData: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>) => {
    return dispatch(createClient(clientData)).unwrap();
  };

  const editClient = async (id: string, clientData: Partial<Client>) => {
    return dispatch(updateClient({ id, clientData })).unwrap();
  };

  const removeClient = async (id: string) => {
    return dispatch(deleteClient(id)).unwrap();
  };

  const clearClient = () => {
    dispatch(clearCurrentClient());
  };

  const updateClientFilters = (newFilters: Partial<ClientFilter>) => {
    dispatch(setFilters(newFilters));
  };

  const resetAllFilters = () => {
    dispatch(resetFilters());
  };

  // Effect to load clients when filters change
  useEffect(() => {
    getClients({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
    });
  }, [filters]);

  return {
    // State
    clients,
    currentClient,
    filteredClients,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    getClients,
    search,
    getClient: getClientById,
    fetchClient,
    addClient,
    editClient,
    deleteClient: removeClient,
    clearCurrentClient: clearClient,
    updateFilters: updateClientFilters,
    resetFilters: resetAllFilters,
  };
};

export default useClients;

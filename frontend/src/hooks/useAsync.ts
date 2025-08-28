import { useState, useCallback } from 'react';

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

interface UseAsyncOptions {
  initialLoading?: boolean;
  throwOnError?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncResult<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  options: UseAsyncOptions = {}
): UseAsyncResult<T> {
  const { 
    initialLoading = false, 
    throwOnError = false,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);

  const execute = useCallback(
    async (...args: any[]) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await asyncFunction(...args);
        setData(response);
        onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        onError?.(error);
        
        if (throwOnError) {
          throw error;
        }
        
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, onError, onSuccess, throwOnError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    data,
    error,
    isLoading,
    setData,
    setError,
    reset,
  };
}

// Example usage:
/*
const { 
  execute: fetchData, 
  data, 
  error, 
  isLoading,
  reset 
} = useAsync<DataType>(
  async (id: string) => {
    const response = await api.get(`/data/${id}`);
    return response.data;
  },
  {
    onSuccess: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Error loading data:', error),
  }
);

// In your component:
useEffect(() => {
  fetchData('123');
}, [fetchData]);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} onRetry={() => fetchData('123')} />;
*/

export default useAsync;

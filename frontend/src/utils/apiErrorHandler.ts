import { message } from 'antd';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Array<{ msg: string; param?: string }>;
}

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred'): string => {
  // Handle axios errors
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Network error
    if (axiosError.code === 'ERR_NETWORK') {
      message.error('Network error. Please check your connection.');
      return 'Network error';
    }

    // Server responded with an error status
    if (axiosError.response) {
      const { data, status } = axiosError.response;
      
      // Handle different HTTP status codes
      switch (status) {
        case 400:
          // Handle validation errors
          if (data.errors) {
            const errorMessages = data.errors.map(err => 
              err.param ? `${err.param}: ${err.msg}` : err.msg
            );
            message.error(errorMessages.join('\n'));
            return 'Validation error';
          }
          break;
          
        case 401:
          message.error('Session expired. Please log in again.');
          // Redirect to login or refresh token logic would go here
          return 'Unauthorized';
          
        case 403:
          message.error('You do not have permission to perform this action.');
          return 'Forbidden';
          
        case 404:
          message.error('The requested resource was not found.');
          return 'Not found';
          
        case 500:
          message.error('An internal server error occurred. Please try again later.');
          return 'Server error';
      }
      
      // Handle custom error messages from the API
      const errorMessage = data.message || data.error || defaultMessage;
      if (errorMessage) {
        message.error(errorMessage);
        return errorMessage;
      }
    }
  }
  
  // Fallback for unhandled errors
  console.error('Unhandled API error:', error);
  message.error(defaultMessage);
  return defaultMessage;
};

// Example usage:
/*
try {
  const response = await api.get('/some-endpoint');
  return response.data;
} catch (error) {
  handleApiError(error, 'Failed to load data');
  throw error; // Re-throw if needed for the caller to handle
}
*/

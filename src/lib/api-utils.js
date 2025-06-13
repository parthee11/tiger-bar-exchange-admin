/**
 * Utility functions for API error handling
 */

/**
 * Format API error message for display
 * 
 * @param {Error} error - The error object from API call
 * @returns {string} Formatted error message
 */
export function formatApiError(error) {
  if (!error) return 'An unknown error occurred';
  
  // Handle axios error response
  if (error.response) {
    const { status, data } = error.response;
    
    // Check if the server returned a message
    if (data && data.message) {
      return data.message;
    }
    
    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your data and try again.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'A server error occurred. Please try again later.';
      default:
        return `Error ${status}: An unexpected error occurred.`;
    }
  }
  
  // Network errors
  if (error.request && !error.response) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Use error message if available, otherwise generic message
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Safely handle API requests with consistent error handling
 * 
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Object} options - Options for handling the API call
 * @param {Function} options.onSuccess - Callback for successful API calls
 * @param {Function} options.onError - Additional error handling callback
 * @returns {Promise} Result of the API call or null if error
 */
export async function safeApiCall(apiCall, { onSuccess, onError } = {}) {
  try {
    const result = await apiCall();
    if (onSuccess) {
      onSuccess(result);
    }
    return result;
  } catch (error) {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear auth data if not already done by interceptor
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (onError) {
      onError(error);
    }
    
    console.error('API Error:', formatApiError(error));
    return null;
  }
}/**
 * Utility functions for API error handling
 */

/**
 * Format API error message for display
 * 
 * @param {Error} error - The error object from API call
 * @returns {string} Formatted error message
 */
export function formatApiError(error) {
  if (!error) return 'An unknown error occurred';
  
  // Handle axios error response
  if (error.response) {
    const { status, data } = error.response;
    
    // Check if the server returned a message
    if (data && data.message) {
      return data.message;
    }
    
    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your data and try again.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'A server error occurred. Please try again later.';
      default:
        return `Error ${status}: An unexpected error occurred.`;
    }
  }
  
  // Network errors
  if (error.request && !error.response) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Use error message if available, otherwise generic message
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Safely handle API requests with consistent error handling
 * 
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Object} options - Options for handling the API call
 * @param {Function} options.onSuccess - Callback for successful API calls
 * @param {Function} options.onError - Additional error handling callback
 * @returns {Promise} Result of the API call or null if error
 */
export async function safeApiCall(apiCall, { onSuccess, onError } = {}) {
  try {
    const result = await apiCall();
    if (onSuccess) {
      onSuccess(result);
    }
    return result;
  } catch (error) {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear auth data if not already done by interceptor
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (onError) {
      onError(error);
    }
    
    console.error('API Error:', formatApiError(error));
    return null;
  }
}
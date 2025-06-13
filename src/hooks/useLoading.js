import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 * 
 * @param {boolean} initialState - Initial loading state
 * @returns {Object} Loading state and utility functions
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  /**
   * Start loading state
   */
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  /**
   * Stop loading state
   */
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * Set error and stop loading
   * 
   * @param {Error} error - Error object
   */
  const setLoadingError = useCallback((error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wrap an async function with loading state management
   * 
   * @param {Function} asyncFn - Async function to wrap
   * @returns {Function} Wrapped function that manages loading state
   */
  const withLoading = useCallback(
    (asyncFn) => async (...args) => {
      startLoading();
      try {
        const result = await asyncFn(...args);
        stopLoading();
        return result;
      } catch (error) {
        setLoadingError(error);
        throw error;
      }
    },
    [startLoading, stopLoading, setLoadingError]
  );

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    clearError,
    withLoading,
  };
}
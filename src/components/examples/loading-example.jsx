import { useEffect, useState } from 'react';
import { useLoading } from '../../hooks/useLoading';
import { safeApiCall, formatApiError } from '../../lib/api-utils';
import { itemsApi } from '../../api/api';
import { Button } from '../ui/button';

/**
 * Example component demonstrating the use of loading and error handling utilities
 */
export function LoadingExample() {
  const [items, setItems] = useState([]);
  const { isLoading, error, withLoading, clearError } = useLoading();

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Function to load items with loading state management
  const loadItems = withLoading(async () => {
    await safeApiCall(
      () => itemsApi.getItems(),
      {
        onSuccess: (data) => {
          setItems(data.items || []);
        },
      }
    );
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Items</h2>
      
      {/* Display API errors */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {formatApiError(error)}
              </h3>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearError}
                  className="mr-2"
                >
                  Dismiss
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadItems}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Items list */}
          {items.length > 0 ? (
            <ul className="divide-y divide-gray-200 border rounded-md">
              {items.map((item) => (
                <li key={item.id} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-sm font-medium">${item.price}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-8 text-gray-500">No items found</p>
          )}
          
          {/* Refresh button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={loadItems}
              disabled={isLoading}
            >
              Refresh Items
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
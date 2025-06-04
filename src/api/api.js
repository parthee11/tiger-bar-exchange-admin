import apiClient from './index';
import authApi from './auth';
import itemsApi from './items';
import ordersApi from './orders';
import branchesApi from './branches';
import prebookingsApi from './prebookings';
import loyaltyApi from './loyalty';
import categoriesApi from './categories';
import mixersApi from './mixers';

// Export all API modules
export {
  apiClient,
  authApi,
  itemsApi,
  ordersApi,
  branchesApi,
  prebookingsApi,
  loyaltyApi,
  categoriesApi,
  mixersApi,
};

// Export a default object with all APIs
const api = {
  auth: authApi,
  items: itemsApi,
  orders: ordersApi,
  branches: branchesApi,
  prebookings: prebookingsApi,
  loyalty: loyaltyApi,
  categories: categoriesApi,
  mixers: mixersApi,
};

export default api;
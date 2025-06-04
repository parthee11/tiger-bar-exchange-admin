import apiClient from './index';
import authApi from './auth';
import itemsApi from './items';
import ordersApi from './orders';
import branchesApi from './branches';
import prebookingsApi from './prebookings';
import loyaltyApi from './loyalty';
import categoriesApi from './categories';
import mixersApi from './mixers';
import settingsApi from './settings';

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
  settingsApi,
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
  settings: settingsApi,
};

export default api;
import apiClient from './index';

/**
 * Loyalty API functions
 */
const loyaltyApi = {
  /**
   * Get loyalty program status
   * @returns {Promise} - Promise with loyalty program status
   */
  getLoyaltyStatus: async () => {
    try {
      const response = await apiClient.get('/loyalty/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update loyalty program status (enable/disable)
   * @param {boolean} enabled - Whether the loyalty program is enabled
   * @returns {Promise} - Promise with updated status
   */
  updateLoyaltyStatus: async (enabled) => {
    try {
      const response = await apiClient.put('/loyalty/status', { enabled });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all loyalty customers (users with loyalty points)
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with loyalty customers data
   */
  getLoyaltyCustomers: async (params = {}) => {
    try {
      // Use the admin users endpoint to get users with loyalty information
      const response = await apiClient.get('/admin/users', { 
        params: { 
          ...params,
          role: 'user' // Filter to only get regular users
        } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get loyalty customer by ID
   * @param {string} id - Loyalty customer ID
   * @returns {Promise} - Promise with loyalty customer data
   */
  getLoyaltyCustomer: async (id) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Add points to a customer
   * @param {string} customerId - Customer ID
   * @param {Object} pointsData - Points data (amount, reason, etc.)
   * @returns {Promise} - Promise with updated customer data
   */
  addPoints: async (customerId, pointsData) => {
    try {
      // Use the exact format required by the API
      const requestBody = {
        points: pointsData.amount,
        operation: 'add',
        reason: pointsData.reason || 'Admin adjustment'
      };
      
      const response = await apiClient.put(`/admin/users/${customerId}/loyalty`, requestBody);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Redeem points for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} redeemData - Redeem data (amount, reward, etc.)
   * @returns {Promise} - Promise with updated customer data
   */
  redeemPoints: async (customerId, redeemData) => {
    try {
      const requestBody = {
        points: redeemData.amount,
        operation: 'redeem',
        reason: redeemData.reason || 'Points redemption'
      };
      
      const response = await apiClient.put(`/admin/users/${customerId}/loyalty`, requestBody);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get loyalty statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with loyalty statistics
   */
  getLoyaltyStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/loyalty/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default loyaltyApi;
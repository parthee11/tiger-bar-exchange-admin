import apiClient from './index';

/**
 * Loyalty API functions
 */
const loyaltyApi = {
  /**
   * Get all loyalty programs
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with loyalty programs data
   */
  getLoyaltyPrograms: async (params = {}) => {
    try {
      const response = await apiClient.get('/loyalty/programs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get loyalty program by ID
   * @param {string} id - Loyalty program ID
   * @returns {Promise} - Promise with loyalty program data
   */
  getLoyaltyProgram: async (id) => {
    try {
      const response = await apiClient.get(`/loyalty/programs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new loyalty program
   * @param {Object} programData - Loyalty program data
   * @returns {Promise} - Promise with created loyalty program data
   */
  createLoyaltyProgram: async (programData) => {
    try {
      const response = await apiClient.post('/loyalty/programs', programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a loyalty program
   * @param {string} id - Loyalty program ID
   * @param {Object} programData - Loyalty program data to update
   * @returns {Promise} - Promise with updated loyalty program data
   */
  updateLoyaltyProgram: async (id, programData) => {
    try {
      const response = await apiClient.put(`/loyalty/programs/${id}`, programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a loyalty program
   * @param {string} id - Loyalty program ID
   * @returns {Promise} - Promise with success status
   */
  deleteLoyaltyProgram: async (id) => {
    try {
      const response = await apiClient.delete(`/loyalty/programs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all loyalty customers
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with loyalty customers data
   */
  getLoyaltyCustomers: async (params = {}) => {
    try {
      const response = await apiClient.get('/loyalty/customers', { params });
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
      const response = await apiClient.get(`/loyalty/customers/${id}`);
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
      const response = await apiClient.post(`/loyalty/customers/${customerId}/points/add`, pointsData);
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
      const response = await apiClient.post(`/loyalty/customers/${customerId}/points/redeem`, redeemData);
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
  },
};

export default loyaltyApi;
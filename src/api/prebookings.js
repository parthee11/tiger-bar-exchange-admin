import apiClient from './index';

/**
 * Prebookings API functions
 */
const prebookingsApi = {
  /**
   * Get all prebookings
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with prebookings data
   */
  getPrebookings: async (params = {}) => {
    try {
      const response = await apiClient.get('/prebookings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get prebooking by ID
   * @param {string} id - Prebooking ID
   * @returns {Promise} - Promise with prebooking data
   */
  getPrebooking: async (id) => {
    try {
      const response = await apiClient.get(`/prebookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new prebooking
   * @param {Object} prebookingData - Prebooking data
   * @returns {Promise} - Promise with created prebooking data
   */
  createPrebooking: async (prebookingData) => {
    try {
      const response = await apiClient.post('/prebookings', prebookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a prebooking
   * @param {string} id - Prebooking ID
   * @param {Object} prebookingData - Prebooking data to update
   * @returns {Promise} - Promise with updated prebooking data
   */
  updatePrebooking: async (id, prebookingData) => {
    try {
      const response = await apiClient.put(`/prebookings/${id}`, prebookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a prebooking
   * @param {string} id - Prebooking ID
   * @returns {Promise} - Promise with success status
   */
  deletePrebooking: async (id) => {
    try {
      const response = await apiClient.delete(`/prebookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Confirm a prebooking
   * @param {string} id - Prebooking ID
   * @returns {Promise} - Promise with confirmed prebooking data
   */
  confirmPrebooking: async (id) => {
    try {
      const response = await apiClient.post(`/prebookings/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cancel a prebooking
   * @param {string} id - Prebooking ID
   * @param {Object} cancelData - Cancellation data (reason, etc.)
   * @returns {Promise} - Promise with cancelled prebooking data
   */
  cancelPrebooking: async (id, cancelData = {}) => {
    try {
      const response = await apiClient.post(`/prebookings/${id}/cancel`, cancelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default prebookingsApi;
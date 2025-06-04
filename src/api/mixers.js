import apiClient from './index';

/**
 * Mixers API functions
 */
const mixersApi = {
  /**
   * Get all mixers
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with mixers data
   */
  getMixers: async (params = {}) => {
    try {
      const response = await apiClient.get('/mixers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get mixer by ID
   * @param {string} id - Mixer ID
   * @returns {Promise} - Promise with mixer data
   */
  getMixer: async (id) => {
    try {
      const response = await apiClient.get(`/mixers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new mixer
   * @param {Object} mixerData - Mixer data
   * @returns {Promise} - Promise with created mixer data
   */
  createMixer: async (mixerData) => {
    try {
      const response = await apiClient.post('/mixers', mixerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a mixer
   * @param {string} id - Mixer ID
   * @param {Object} mixerData - Mixer data to update
   * @returns {Promise} - Promise with updated mixer data
   */
  updateMixer: async (id, mixerData) => {
    try {
      const response = await apiClient.put(`/mixers/${id}`, mixerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a mixer
   * @param {string} id - Mixer ID
   * @returns {Promise} - Promise with success status
   */
  deleteMixer: async (id) => {
    try {
      const response = await apiClient.delete(`/mixers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  /**
   * Bulk import mixers
   * @param {Array} mixers - Array of mixer objects with name, price, and available status
   * @returns {Promise} - Promise with import results
   */
  bulkImportMixers: async (mixers) => {
    try {
      const response = await apiClient.post('/mixers/bulk', { mixers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default mixersApi;
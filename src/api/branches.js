import apiClient from './index';

/**
 * Branches API functions
 */
const branchesApi = {
  /**
   * Get all branches
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with branches data
   */
  getBranches: async (params = {}) => {
    try {
      const response = await apiClient.get('/branches', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get branch by ID
   * @param {string} id - Branch ID
   * @returns {Promise} - Promise with branch data
   */
  getBranch: async (id) => {
    try {
      const response = await apiClient.get(`/branches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new branch
   * @param {Object} branchData - Branch data with name, address, contactNumber, numberOfTables, isActive
   * @returns {Promise} - Promise with created branch data
   */
  createBranch: async (branchData) => {
    try {
      const response = await apiClient.post('/branches', branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a branch
   * @param {string} id - Branch ID
   * @param {Object} branchData - Branch data to update (name, address, phone, email, openingHours, isActive)
   * @returns {Promise} - Promise with updated branch data
   */
  updateBranch: async (id, branchData) => {
    try {
      const response = await apiClient.put(`/branches/${id}`, branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a branch
   * @param {string} id - Branch ID
   * @returns {Promise} - Promise with success status
   */
  deleteBranch: async (id) => {
    try {
      const response = await apiClient.delete(`/branches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default branchesApi;
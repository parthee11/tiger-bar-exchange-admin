import apiClient from './index';

/**
 * Tables API functions
 */
const tablesApi = {
  /**
   * Get tables for a branch
   * @param {string} branchId - Branch ID
   * @returns {Promise} - Promise with tables data
   */
  getBranchTables: async (branchId) => {
    try {
      const response = await apiClient.get(`/branches/${branchId}/tables`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Add a table to a branch
   * @param {string} branchId - Branch ID
   * @param {Object} tableData - Table data with tableNumber, status, capacity, section
   * @returns {Promise} - Promise with created table data
   */
  addTable: async (branchId, tableData) => {
    try {
      const response = await apiClient.post(`/branches/${branchId}/tables`, tableData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update table status
   * @param {string} branchId - Branch ID
   * @param {string} tableId - Table ID
   * @param {string} status - New status (available, occupied, reserved, maintenance)
   * @returns {Promise} - Promise with updated table data
   */
  updateTableStatus: async (branchId, tableId, status) => {
    try {
      const response = await apiClient.put(`/branches/${branchId}/tables/${tableId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update table details
   * @param {string} branchId - Branch ID
   * @param {string} tableId - Table ID
   * @param {Object} tableData - Updated table data (status, tableNumber, etc.)
   * @returns {Promise} - Promise with updated table data
   */
  updateTable: async (branchId, tableId, tableData) => {
    try {
      const response = await apiClient.put(`/branches/${branchId}/tables/${tableId}`, tableData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a table from a branch
   * @param {string} branchId - Branch ID
   * @param {string} tableId - Table ID
   * @returns {Promise} - Promise with success status
   */
  deleteTable: async (branchId, tableId) => {
    try {
      if (!branchId || !tableId) {
        return {
          success: false,
          message: 'Branch ID and Table ID are required'
        };
      }
      
      const response = await apiClient.delete(`/branches/${branchId}/tables/${tableId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting table:', error);
      
      // Handle specific error cases
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        if (statusCode === 404) {
          return {
            success: false,
            message: 'Table not found or already deleted'
          };
        } else if (statusCode === 403) {
          return {
            success: false,
            message: 'You do not have permission to delete this table'
          };
        } else if (statusCode === 400) {
          return {
            success: false,
            message: errorData.message || 'Invalid request to delete table'
          };
        }
        
        return {
          success: false,
          message: errorData.message || 'Server error while deleting table'
        };
      } else if (error.request) {
        // The request was made but no response was received
        return {
          success: false,
          message: 'No response from server. Please check your connection and try again.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          success: false,
          message: error.message || 'An unexpected error occurred'
        };
      }
    }
  },
};

export default tablesApi;
import apiClient from './index';

/**
 * Items API functions
 */
const itemsApi = {
  /**
   * Get all items
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with items data
   */
  getItems: async (params = {}) => {
    try {
      const response = await apiClient.get('/items', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Promise} - Promise with item data
   */
  getItem: async (id) => {
    try {
      const response = await apiClient.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new item
   * @param {Object} itemData - Item data
   * @returns {Promise} - Promise with created item data
   */
  createItem: async (itemData) => {
    try {
      const response = await apiClient.post('/items', itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an item
   * @param {string} id - Item ID
   * @param {Object} itemData - Item data to update
   * @returns {Promise} - Promise with updated item data
   */
  updateItem: async (id, itemData) => {
    try {
      const response = await apiClient.put(`/items/${id}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete an item
   * @param {string} id - Item ID
   * @returns {Promise} - Promise with success status
   */
  deleteItem: async (id) => {
    try {
      const response = await apiClient.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  /**
   * Bulk import items
   * @param {Array} items - Array of item objects
   * @returns {Promise} - Promise with import results
   */
  bulkImportItems: async (items) => {
    try {
      const response = await apiClient.post('/items/bulk', { items });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default itemsApi;
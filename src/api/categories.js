import apiClient from './index';

/**
 * Categories API functions
 */
const categoriesApi = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with categories data
   */
  getCategories: async (params = {}) => {
    try {
      const response = await apiClient.get('/categories', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise} - Promise with category data
   */
  getCategory: async (id) => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data with name, type, description
   * @returns {Promise} - Promise with created category data
   */
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Category data to update (name, type, description)
   * @returns {Promise} - Promise with updated category data
   */
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise} - Promise with success status
   */
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  /**
   * Bulk import categories
   * @param {Array} categories - Array of category objects with name, type, description
   * @returns {Promise} - Promise with import results
   */
  bulkImportCategories: async (categories) => {
    try {
      const response = await apiClient.post('/categories/bulk', { categories });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default categoriesApi;
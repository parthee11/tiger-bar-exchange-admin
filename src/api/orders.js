import apiClient from './index';

/**
 * Orders API functions
 */
const ordersApi = {
  /**
   * Get all orders
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with orders data
   */
  getOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  /**
   * Get all orders (using the specific endpoint)
   * @returns {Promise} - Promise with all orders data
   */
  getAllOrders: async () => {
    try {
      const response = await apiClient.get('/orders/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise} - Promise with order data
   */
  getOrder: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise} - Promise with created order data
   */
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an order
   * @param {string} id - Order ID
   * @param {Object} orderData - Order data to update
   * @returns {Promise} - Promise with updated order data
   */
  updateOrder: async (id, orderData) => {
    try {
      const response = await apiClient.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status (completed, pending, cancelled)
   * @returns {Promise} - Promise with updated order data
   */
  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete an order
   * @param {string} id - Order ID
   * @returns {Promise} - Promise with success status
   */
  deleteOrder: async (id) => {
    try {
      const response = await apiClient.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get order statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with order statistics
   */
  getOrderStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/orders/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default ordersApi;
import apiClient from './index';

/**
 * Users API functions
 */
const usersApi = {
  /**
   * Get all users
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with users data
   */
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} - Promise with user data
   */
  getUser: async (id) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} - Promise with updated user data
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user loyalty points
   * @param {string} id - User ID
   * @param {Object} pointsData - Points data (amount, reason, etc.)
   * @returns {Promise} - Promise with updated user data
   */
  updateLoyaltyPoints: async (id, pointsData) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}/loyalty`, {
        points: pointsData.amount,
        operation: pointsData.operation || 'add',
        reason: pointsData.reason || 'Admin adjustment'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user signup reward/coupon status
   * @param {string} id - User ID
   * @param {Object} rewardData - Reward data (claimed, used, etc.)
   * @returns {Promise} - Promise with updated user data
   */
  updateSignupReward: async (id, rewardData) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, {
        signupReward: rewardData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default usersApi;
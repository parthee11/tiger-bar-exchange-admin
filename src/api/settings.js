import apiClient from './index';

/**
 * Settings API functions
 */
const settingsApi = {
  /**
   * Get loyalty program enabled status
   * @returns {Promise} - Promise with loyalty program enabled status
   */
  getLoyaltyProgramEnabled: async () => {
    try {
      const response = await apiClient.get('/admin/loyalty/status');
      return response.data;
    } catch (error) {
      console.error('Error getting loyalty program enabled status:', error);
      throw error;
    }
  },

  /**
   * Update loyalty program enabled status
   * @param {boolean} enabled - Whether the loyalty program is enabled
   * @returns {Promise} - Promise with updated loyalty program enabled status
   */
  updateLoyaltyProgramEnabled: async (enabled) => {
    try {
      const response = await apiClient.put('/settings/loyaltyProgramEnabled', { value: enabled });
      return response.data;
    } catch (error) {
      console.error('Error updating loyalty program enabled status:', error);
      throw error;
    }
  }
};

export default settingsApi;
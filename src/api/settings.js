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
      // Try the new settings endpoint first
      const response = await apiClient.get('/admin/settings/loyaltyProgramEnabled');
      return response.data;
    } catch (error) {
      // Fallback to the old endpoint if the new one fails
      try {
        const response = await apiClient.get('/admin/loyalty/status');
        return response.data;
      } catch (fallbackError) {
        // Return a default value if both fail
        return { enabled: true };
      }
    }
  },

  /**
   * Update loyalty program enabled status
   * @param {boolean} enabled - Whether the loyalty program is enabled
   * @returns {Promise} - Promise with updated loyalty program enabled status
   */
  updateLoyaltyProgramEnabled: async (enabled) => {
    try {
      // Try the new settings endpoint first
      const response = await apiClient.put('/admin/settings/loyaltyProgramEnabled', {
        value: enabled,
      });
      return response.data;
    } catch (error) {
      // Fallback to the old endpoint if the new one fails
      const response = await apiClient.put('/settings/loyaltyProgramEnabled', {
        value: enabled,
      });
      return response.data;
    }
  },

  /**
   * Get loyalty percentage for orders
   * @returns {Promise} - Promise with loyalty percentage value
   */
  getLoyaltyPercentage: async () => {
    try {
      // Try the new settings endpoint first
      const response = await apiClient.get(
        '/admin/settings/loyaltyPercentage',
      );
      return response.data;
    } catch (error) {
      // Fallback to the old endpoint if the new one fails
      try {
        const response = await apiClient.get('/settings/loyaltyPercentage');
        return response.data;
      } catch (fallbackError) {
        // Return a default value if both fail
        return { value: 1 };
      }
    }
  },

  /**
   * Update loyalty percentage for orders
   * @param {number} percentage - Percentage of order total to award as loyalty points
   * @returns {Promise} - Promise with updated loyalty percentage
   */
  updateLoyaltyPercentage: async (percentage) => {
    try {
      // Try the new settings endpoint first
      const response = await apiClient.put(
        '/admin/settings/loyaltyPercentage',
        {
          value: percentage,
        },
      );
      return response.data;
    } catch (error) {
      // Fallback to the old endpoint if the new one fails
      const response = await apiClient.put('/settings/loyaltyPercentage', {
        value: percentage,
      });
      return response.data;
    }
  },

  /**
   * Get price inactivity threshold
   * @returns {Promise} - Promise with price inactivity threshold value
   */
  getPriceInactivityThreshold: async () => {
    try {
      const response = await apiClient.get('/admin/settings/priceInactivityThreshold');
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: 30 };
    }
  },

  /**
   * Update price inactivity threshold
   * @param {number} minutes - Number of minutes of inactivity before price decreases
   * @returns {Promise} - Promise with updated threshold
   */
  updatePriceInactivityThreshold: async (minutes) => {
    const response = await apiClient.put('/admin/settings/priceInactivityThreshold', {
      value: minutes,
    });
    return response.data;
  },

  /**
   * Get price check interval
   * @returns {Promise} - Promise with price check interval value
   */
  getPriceCheckInterval: async () => {
    try {
      const response = await apiClient.get('/admin/settings/priceCheckInterval');
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: 30 };
    }
  },

  /**
   * Update price check interval
   * @param {number} minutes - Number of minutes between price checks by the scheduler
   * @returns {Promise} - Promise with updated interval
   */
  updatePriceCheckInterval: async (minutes) => {
    const response = await apiClient.put('/admin/settings/priceCheckInterval', {
      value: minutes,
    });
    return response.data;
  },

  /**
   * Get lowest price drop setting
   * @returns {Promise} - Promise with lowest price drop value
   */
  getLowestPriceDrop: async () => {
    try {
      const response = await apiClient.get('/admin/settings/lowestPriceDrop');
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: 20 };
    }
  },

  /**
   * Update lowest price drop setting
   * @param {number} amount - Maximum amount (in AED) that prices can drop below floor price
   * @returns {Promise} - Promise with updated setting
   */
  updateLowestPriceDrop: async (amount) => {
    const response = await apiClient.put('/admin/settings/lowestPriceDrop', {
      value: amount,
    });
    return response.data;
  },

  /**
   * Get lowest price drop type setting
   * @returns {Promise} - Promise with lowest price drop type value ('value' or 'percentage')
   */
  getLowestPriceDropType: async () => {
    try {
      const response = await apiClient.get('/admin/settings/lowestPriceDropType');
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: 'value' };
    }
  },

  /**
   * Update lowest price drop type setting
   * @param {string} type - Type of drop calculation ('value' or 'percentage')
   * @returns {Promise} - Promise with updated setting
   */
  updateLowestPriceDropType: async (type) => {
    const response = await apiClient.put('/admin/settings/lowestPriceDropType', {
      value: type,
    });
    return response.data;
  },

  /**
   * Get lowest price drop percentage setting
   * @returns {Promise} - Promise with lowest price drop percentage value
   */
  getLowestPriceDropPercentage: async () => {
    try {
      const response = await apiClient.get('/admin/settings/lowestPriceDropPercentage');
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: 50 };
    }
  },

  /**
   * Update lowest price drop percentage setting
   * @param {number} percentage - Percentage of floor price that prices can drop below
   * @returns {Promise} - Promise with updated setting
   */
  updateLowestPriceDropPercentage: async (percentage) => {
    const response = await apiClient.put('/admin/settings/lowestPriceDropPercentage', {
      value: percentage,
    });
    return response.data;
  },

  /**
   * Get price reset time setting for a specific branch
   * @param {string} branchId - Branch ID
   * @returns {Promise} - Promise with price reset time value
   */
  getPriceResetTime: async (branchId) => {
    try {
      const response = await apiClient.get('/admin/settings/priceResetTime', {
        params: { branchId }
      });
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: '00:00' };
    }
  },

  /**
   * Update price reset time setting for a specific branch
   * @param {string} branchId - Branch ID
   * @param {string} time - Reset time in HH:MM format
   * @returns {Promise} - Promise with updated setting
   */
  updatePriceResetTime: async (branchId, time) => {
    const response = await apiClient.put('/admin/settings/priceResetTime', {
      value: time,
      branchId: branchId
    });
    return response.data;
  },

  /**
   * Get curated highlights for a branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<{data: {trending: string[], topGainers: string[], topLosers: string[]}}>} 
   */
  getHighlights: async (branchId) => {
    try {
      const response = await apiClient.get('/admin/settings/highlights', {
        params: { branchId }
      });
      // The admin getSetting returns { success, data }
      return response.data;
    } catch (error) {
      // Default empty structure if not set yet
      return { data: { trending: [], topGainers: [], topLosers: [] } };
    }
  },

  /**
   * Update curated highlights for a branch
   * @param {string} branchId - Branch ID
   * @param {{trending: string[], topGainers: string[], topLosers: string[]}} value
   * @returns {Promise}
   */
  updateHighlights: async (branchId, value) => {
    const response = await apiClient.put('/admin/settings/highlights', {
      branchId,
      value,
    });
    return response.data;
  },

  /**
   * Get online payment enabled status
   * @returns {Promise} - Promise with online payment enabled status
   */
  getOnlinePaymentEnabled: async () => {
    try {
      const response = await apiClient.get('/admin/settings/onlinePaymentEnabled');
      return response.data;
    } catch (error) {
      // Return a default value if the setting doesn't exist
      return { data: true };
    }
  },

  /**
   * Update online payment enabled status
   * @param {boolean} enabled - Whether online payment is enabled
   * @returns {Promise} - Promise with updated online payment enabled status
   */
  updateOnlinePaymentEnabled: async (enabled) => {
    const response = await apiClient.put('/admin/settings/onlinePaymentEnabled', {
      value: enabled,
    });
    return response.data;
  },
};

export default settingsApi;

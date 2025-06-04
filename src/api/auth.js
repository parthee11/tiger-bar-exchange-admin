import apiClient from './index';

/**
 * Authentication API functions
 */
const authApi = {
  /**
   * Sign in a user with login and password
   * @param {string} login - Username or phone
   * @param {string} password - User password
   * @returns {Promise} - Promise with user data
   */
  signIn: async (login, password) => {
    try {
      const response = await apiClient.post('/auth/signin', { login, password, isAdmin: true });
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Register a new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise with user data
   */
  signUp: async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise} - Promise with success status
   */
  signOut: async () => {
    try {
      await apiClient.post('/auth/logout');
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      // Still remove token and user from localStorage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error.response?.data || error.message;
    }
  },
};

export default authApi;
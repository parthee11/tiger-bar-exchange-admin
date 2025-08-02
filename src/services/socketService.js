/**
 * Socket.io Service for Tiger Bar Exchange Admin
 *
 * This service manages WebSocket connections for real-time updates
 * from the backend server. It handles:
 * - Price updates for items
 * - Market crash notifications
 * - Connection management
 */

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Initialize the Socket.IO connection
   * @param {string} url - The Socket.IO server URL (defaults to API URL without the /api path)
   * @returns {Promise} - Resolves when connected
   */
  connect(customUrl = null) {
    return new Promise((resolve, reject) => {
      try {
        // Clean up any existing connection
        if (this.socket) {
          this.disconnect();
        }

        // Get the base URL from the API URL by removing the /api path
        let url;
        if (customUrl) {
          url = customUrl;
        } else {
          // Try to get the API URL from environment variables
          const apiUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

          // Parse the URL to get just the origin (protocol + hostname + port)
          try {
            const parsedUrl = new URL(apiUrl);
            url = parsedUrl.origin; // This gives us just http://hostname:port
          } catch (e) {
            // If URL parsing fails, fall back to string manipulation
            url = apiUrl.endsWith('/api')
              ? apiUrl.substring(0, apiUrl.length - 4)
              : apiUrl.replace('/api', '');
          }
        }

        // Create new socket connection with options
        const options = {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
          path: '/socket.io', // Explicitly set the socket.io path
          forceNew: true, // Force a new connection
          timeout: 10000, // Increase connection timeout
        };

        // Create the socket connection
        this.socket = io(url, options);

        // Set up event handlers
        this.socket.on('connect', () => {
          this.isConnected = true;
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          console.error('Socket connection error details:', {
            message: error.message,
            description: error.description,
            type: error.type,
            url: url,
          });
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
        });

        // Add additional debugging events
        this.socket.io.on('error', (error) => {
          console.error('Socket.io manager error:', error);
        });

        this.socket.io.on('reconnect_attempt', (attempt) => {
          // Reconnect attempt
        });

        this.socket.io.on('reconnect_failed', () => {
          console.error('Socket.io reconnect failed after all attempts');
        });

        this.socket.on('reconnect', (attemptNumber) => {
          this.isConnected = true;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error);
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
        });
      } catch (error) {
        console.error('Error initializing socket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Subscribe to a specific branch for updates
   * @param {string} branchId - The branch ID to subscribe to
   */
  subscribeToBranch(branchId) {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot subscribe: Socket not connected');
      return;
    }

    const room = `branch:${branchId}`;
    this.socket.emit('subscribe', room);
  }

  /**
   * Unsubscribe from a specific branch
   * @param {string} branchId - The branch ID to unsubscribe from
   */
  unsubscribeFromBranch(branchId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    const room = `branch:${branchId}`;
    this.socket.emit('unsubscribe', room);
  }

  /**
   * Register a listener for price updates
   * @param {Function} callback - The callback function to call when a price update is received
   * @returns {Function} - A function to remove the listener
   */
  onPriceUpdate(callback) {
    return this.addListener('price_update', callback);
  }

  /**
   * Register a listener for market crash events
   * @param {Function} callback - The callback function to call when a market crash event is received
   * @returns {Function} - A function to remove the listener
   */
  onMarketCrash(callback) {
    return this.addListener('market_crash', callback);
  }

  /**
   * Register a listener for market crash end events
   * @param {Function} callback - The callback function to call when a market crash end event is received
   * @returns {Function} - A function to remove the listener
   */
  onMarketCrashEnd(callback) {
    return this.addListener('market_crash_end', callback);
  }

  /**
   * Register a listener for market updates (includes both crash and regular updates)
   * @param {Function} callback - The callback function to call when a market update is received
   * @returns {Function} - A function to remove the listener
   */
  onMarketUpdate(callback) {
    return this.addListener('market_update', callback);
  }

  /**
   * Add a listener for a specific event
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Function} - A function to remove the listener
   */
  addListener(event, callback) {
    if (!this.socket) {
      console.error('Cannot add listener: Socket not initialized');
      return () => {};
    }

    // Store the callback in our listeners map
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Add the listener to the socket
    this.socket.on(event, callback);

    // Return a function to remove the listener
    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }

      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  }

  /**
   * Check if the socket is connected
   * @returns {boolean} - True if connected, false otherwise
   */
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;

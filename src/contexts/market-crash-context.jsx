import { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import branchesApi from '../api/branches';
import socketService from '../services/socketService';

/**
 * Context for managing global market crash state across the admin panel
 */
const MarketCrashContext = createContext(null);

/**
 * Hook to use the market crash context
 * @returns {Object} Market crash context value
 */
export function useMarketCrash() {
  const context = useContext(MarketCrashContext);
  if (!context) {
    throw new Error('useMarketCrash must be used within a MarketCrashProvider');
  }
  return context;
}

/**
 * Provider component for market crash context
 * Monitors all branches for active market crashes and updates global state
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function MarketCrashProvider({ children }) {
  const [isAnyBranchCrashing, setIsAnyBranchCrashing] = useState(false);
  const [crashingBranches, setCrashingBranches] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Track socket listener and polling state
  const listenersAttachedRef = useRef(false);
  const removeCrashListenerRef = useRef(null);
  const removeCrashEndListenerRef = useRef(null);
  const connectivityCheckIntervalRef = useRef(null);
  const fallbackPollIntervalRef = useRef(null);

  /**
   * Check all branches for active market crashes
   */
  const checkMarketCrashStatus = async () => {
    try {
      const response = await branchesApi.getBranches();
      const branches = response.data;
      
      const crashingBranchData = branches.filter(branch => branch.marketCrashActive);
      const hasAnyActiveCrash = crashingBranchData.length > 0;
      
      setIsAnyBranchCrashing(hasAnyActiveCrash);
      setCrashingBranches(crashingBranchData);
      setLastUpdateTime(new Date());
      
      return hasAnyActiveCrash;
    } catch (error) {
      console.error('Error checking market crash status:', error);
      return false;
    }
  };

  /**
   * Force refresh the market crash status
   */
  const refreshMarketCrashStatus = () => {
    checkMarketCrashStatus();
  };

  /**
   * Start monitoring market crash status
   * - Do a one-time initial fetch for baseline
   * - Prefer real-time via socket events (market_crash, market_crash_end)
   * - Fall back to lightweight polling only if socket is not connected
   */
  useEffect(() => {
    let mounted = true;

    // 1) Initial baseline fetch
    checkMarketCrashStatus();

    // Helper to attach socket listeners once connected
    const attachListeners = () => {
      if (listenersAttachedRef.current || !socketService || !socketService.isSocketConnected()) return;

      // Update state immediately on crash events without fetching
      const handleCrash = (payload) => {
        // payload may include branchId; we set a simple flag and refetch details lazily if needed elsewhere
        setIsAnyBranchCrashing(true);
        setLastUpdateTime(new Date());
      };

      const handleCrashEnd = (payload) => {
        // When crash ends, we can’t assume no other branches are crashing; do a single validation fetch
        checkMarketCrashStatus();
      };

      removeCrashListenerRef.current = socketService.onMarketCrash(handleCrash);
      removeCrashEndListenerRef.current = socketService.onMarketCrashEnd(handleCrashEnd);
      listenersAttachedRef.current = true;
    };

    // 2) Try to connect socket and attach listeners
    const ensureSocket = async () => {
      try {
        if (!socketService.isSocketConnected()) {
          await socketService.connect();
        }
        if (!mounted) return;
        attachListeners();
      } catch (e) {
        // If socket connection fails, we'll rely on fallback polling
      }
    };

    ensureSocket();

    // 3) Periodically check connectivity; if disconnected, fall back to polling
    connectivityCheckIntervalRef.current = setInterval(() => {
      const connected = socketService.isSocketConnected && socketService.isSocketConnected();

      if (connected) {
        // If connected: attach listeners (once) and stop fallback polling
        attachListeners();
        if (fallbackPollIntervalRef.current) {
          clearInterval(fallbackPollIntervalRef.current);
          fallbackPollIntervalRef.current = null;
        }
      } else {
        // Not connected: start or maintain a slower fallback poll (e.g., 30s)
        if (!fallbackPollIntervalRef.current) {
          fallbackPollIntervalRef.current = setInterval(checkMarketCrashStatus, 30000);
        }
      }
    }, 5000);

    return () => {
      mounted = false;
      // Clean up connectivity checker
      if (connectivityCheckIntervalRef.current) {
        clearInterval(connectivityCheckIntervalRef.current);
        connectivityCheckIntervalRef.current = null;
      }
      // Clean up fallback polling
      if (fallbackPollIntervalRef.current) {
        clearInterval(fallbackPollIntervalRef.current);
        fallbackPollIntervalRef.current = null;
      }
      // Detach socket listeners
      if (removeCrashListenerRef.current) {
        removeCrashListenerRef.current();
        removeCrashListenerRef.current = null;
      }
      if (removeCrashEndListenerRef.current) {
        removeCrashEndListenerRef.current();
        removeCrashEndListenerRef.current = null;
      }
      listenersAttachedRef.current = false;
    };
  }, []);

  const value = {
    isAnyBranchCrashing,
    crashingBranches,
    lastUpdateTime,
    refreshMarketCrashStatus,
  };

  return (
    <MarketCrashContext.Provider value={value}>
      {children}
    </MarketCrashContext.Provider>
  );
}

MarketCrashProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
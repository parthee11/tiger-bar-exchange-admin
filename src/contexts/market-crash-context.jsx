import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import branchesApi from '../api/branches';

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
   * Start monitoring market crash status with regular updates
   */
  useEffect(() => {
    // Initial check
    checkMarketCrashStatus();
    
    // Set up polling every 10 seconds to check for market crash updates
    const interval = setInterval(checkMarketCrashStatus, 10000);
    
    return () => clearInterval(interval);
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
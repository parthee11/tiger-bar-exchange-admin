import { useMarketCrash } from '../contexts/market-crash-context';
import PropTypes from 'prop-types';

/**
 * Market Crash Visual Effects Component
 * 
 * Provides dramatic red blinking screen effects and spreading red sides
 * when any branch has an active market crash
 */
export function MarketCrashEffects({ children }) {
  const { isAnyBranchCrashing } = useMarketCrash();

  if (!isAnyBranchCrashing) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Red blinking overlay for entire screen */}
      <div 
        className="fixed inset-0 pointer-events-none z-40 market-crash-blink-overlay"
        aria-hidden="true"
      />
      
      {/* Left side red spreading effect */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-20 pointer-events-none z-30 market-crash-left-spread"
        aria-hidden="true"
      />
      
      {/* Right side red spreading effect */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-20 pointer-events-none z-30 market-crash-right-spread"
        aria-hidden="true"
      />
      
      {/* Top edge red spreading effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 pointer-events-none z-30 market-crash-top-spread"
        aria-hidden="true"
      />
      
      {/* Bottom edge red spreading effect */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-4 pointer-events-none z-30 market-crash-bottom-spread"
        aria-hidden="true"
      />
      
      {/* Content with enhanced red tint during market crash */}
      <div className="relative z-10 market-crash-content-tint">
        {children}
      </div>
    </div>
  );
}

MarketCrashEffects.propTypes = {
  children: PropTypes.node.isRequired,
};
import { useMarketCrash } from '../contexts/market-crash-context';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

/**
 * Market Crash Visual Effects Component
 * 
 * Provides dramatic red blinking screen effects and spreading red sides
 * when any branch has an active market crash
 */
export function MarketCrashEffects({ children }) {
  const { isAnyBranchCrashing } = useMarketCrash();
  const [showBanner, setShowBanner] = useState(false);
  const prevCrashRef = useRef(false);

  // Show the banner once when crash becomes active
  useEffect(() => {
    if (!prevCrashRef.current && isAnyBranchCrashing) {
      setShowBanner(true);
    }
    prevCrashRef.current = isAnyBranchCrashing;
  }, [isAnyBranchCrashing]);

  if (!isAnyBranchCrashing) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* One-time sliding banner across the middle (50% screen height) */}
      {showBanner && (
        <>
          <style>{`
            @keyframes marketCrashSlide {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100vw); }
            }
          `}</style>
          <div
            className="fixed left-0 right-0 z-50 pointer-events-none flex items-center justify-center"
            style={{ top: '25vh', height: '50vh' }}
          >
            <div
              style={{
                width: '100vw',
                height: '100%',
                backgroundColor: '#dc2626', // red-600
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '10vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'marketCrashSlide 2.5s linear 1',
              }}
              onAnimationEnd={() => setShowBanner(false)}
            >
              MARKET CRASH
            </div>
          </div>
        </>
      )}

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
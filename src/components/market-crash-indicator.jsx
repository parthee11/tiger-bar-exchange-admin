import { useMarketCrash } from '../contexts/market-crash-context';
import { AlertTriangle } from 'lucide-react';

/**
 * Market Crash Status Indicator Component
 * 
 * Shows a fixed indicator when any branch has an active market crash
 */
export function MarketCrashIndicator() {
  const { isAnyBranchCrashing, crashingBranches } = useMarketCrash();

  if (!isAnyBranchCrashing) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg animate-pulse border-2 border-red-400">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-red-200" />
        <div>
          <div className="font-bold text-sm">MARKET CRASH ACTIVE</div>
          <div className="text-xs text-red-200">
            {crashingBranches.length} branch{crashingBranches.length !== 1 ? 'es' : ''} affected
          </div>
        </div>
      </div>
    </div>
  );
}
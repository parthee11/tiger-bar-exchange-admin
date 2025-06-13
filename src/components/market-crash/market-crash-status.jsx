import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Building, Clock } from "lucide-react";

/**
 * MarketCrashStatus component for displaying the current status of a market crash
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedBranch - Currently selected branch ID
 * @param {Object} props.branchData - Data for the selected branch
 * @param {Function} props.formatCrashTime - Function to format crash time
 * @param {string} props.timeRemaining - Time remaining in the crash
 * @param {Function} props.onEndCrash - Function to call when end crash button is clicked
 * @param {boolean} props.loading - Whether a request is in progress
 * @returns {JSX.Element} MarketCrashStatus component
 */
export function MarketCrashStatus({
  selectedBranch,
  branchData,
  formatCrashTime,
  timeRemaining,
  onEndCrash,
  loading
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Status</CardTitle>
        <CardDescription>
          Market crash status for {branchData?.name || 'selected branch'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedBranch ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <div className="rounded-full bg-blue-100 p-3">
              <Building className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="text-xl font-medium text-center">No Branch Selected</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please select a branch to view its market crash status
            </p>
          </div>
        ) : branchData?.marketCrashActive ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <div className="rounded-full bg-red-100 p-3">
              <Clock className="h-6 w-6 text-red-700" />
            </div>
            <h3 className="text-xl font-medium text-center">Market Crash Active</h3>
            <p className="text-sm text-center">
              Started: {formatCrashTime(branchData.marketCrashStartTime)}
            </p>
            <p className="text-sm text-center">
              Duration: {branchData.marketCrashDuration || 15} minutes
            </p>
            <p className="text-sm text-center">
              Time remaining: {timeRemaining || 'calculating...'}
            </p>
            <Button
              variant="outline"
              onClick={onEndCrash}
              disabled={loading}
            >
              End Market Crash
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <div className="rounded-full bg-green-100 p-3">
              <Clock className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="text-xl font-medium text-center">No Active Crash</h3>
            <p className="text-sm text-muted-foreground text-center">
              The market is currently stable for this branch. Prices are at normal levels.
            </p>
            {branchData?.marketCrashEndTime && (
              <p className="text-sm text-center">
                Last crash ended: {formatCrashTime(branchData.marketCrashEndTime)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
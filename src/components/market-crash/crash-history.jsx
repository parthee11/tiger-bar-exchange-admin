import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { History } from "lucide-react";

/**
 * CrashHistory component for displaying market crash history
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedBranch - Currently selected branch ID
 * @param {Object} props.branchData - Data for the selected branch
 * @param {Function} props.formatCrashTime - Function to format crash time
 * @param {Function} props.calculateCrashDuration - Function to calculate crash duration
 * @returns {JSX.Element} CrashHistory component
 */
export function CrashHistory({
  selectedBranch,
  branchData,
  formatCrashTime,
  calculateCrashDuration
}) {
  if (!selectedBranch) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div>
          <CardTitle>Crash History</CardTitle>
          <CardDescription>
            Recent market crash events for {branchData?.name || 'selected branch'}
          </CardDescription>
        </div>
        <History className="ml-auto h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {branchData?.marketCrashStartTime ? (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm">
                  <th className="p-3 text-left font-medium">Date & Time</th>
                  <th className="p-3 text-left font-medium">Duration</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">{formatCrashTime(branchData.marketCrashStartTime)}</td>
                  <td className="p-3">
                    {calculateCrashDuration(
                      branchData.marketCrashStartTime,
                      branchData.marketCrashEndTime,
                    )}
                  </td>
                  <td className="p-3">
                    {branchData.marketCrashActive ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Ended
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No market crash history available for this branch
          </p>
        )}
      </CardContent>
    </Card>
  );
}
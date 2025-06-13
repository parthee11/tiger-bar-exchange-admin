import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectOption } from "../../components/ui/select";
import { AlertTriangle } from "lucide-react";

/**
 * MarketCrashTrigger component for triggering a market crash
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedBranch - Currently selected branch ID
 * @param {number} props.crashPercentage - Selected crash percentage
 * @param {Function} props.onCrashPercentageChange - Function to call when crash percentage changes
 * @param {number} props.crashDuration - Selected crash duration in minutes
 * @param {Function} props.onCrashDurationChange - Function to call when crash duration changes
 * @param {Function} props.onTriggerCrash - Function to call when trigger button is clicked
 * @param {boolean} props.loading - Whether a request is in progress
 * @param {boolean} props.isCrashActive - Whether a market crash is currently active
 * @returns {JSX.Element} MarketCrashTrigger component
 */
export function MarketCrashTrigger({
  selectedBranch,
  crashPercentage,
  onCrashPercentageChange,
  crashDuration,
  onCrashDurationChange,
  onTriggerCrash,
  loading,
  isCrashActive
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Market Crash</CardTitle>
        <CardDescription>
          Initiate a market crash to drop prices for the selected branch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4 bg-amber-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Warning</h4>
              <p className="text-sm text-amber-700 mt-1">
                Triggering a market crash will significantly reduce prices for all items in this branch.
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="intensity">
            Crash Intensity
          </label>
          <Select
            id="intensity"
            value={crashPercentage.toString()}
            onChange={onCrashPercentageChange}
            disabled={!selectedBranch || loading || isCrashActive}
          >
            <SelectOption value="20">Low (20% toward floor price)</SelectOption>
            <SelectOption value="35">Medium (35% toward floor price)</SelectOption>
            <SelectOption value="50">High (50% toward floor price)</SelectOption>
            <SelectOption value="75">Severe (75% toward floor price)</SelectOption>
            <SelectOption value="90">Extreme (90% toward floor price)</SelectOption>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="duration">
            Crash Duration
          </label>
          <Select
            id="duration"
            value={crashDuration.toString()}
            onChange={onCrashDurationChange}
            disabled={!selectedBranch || loading || isCrashActive}
          >
            <SelectOption value="5">5 minutes</SelectOption>
            <SelectOption value="10">10 minutes</SelectOption>
            <SelectOption value="15">15 minutes</SelectOption>
            <SelectOption value="30">30 minutes</SelectOption>
            <SelectOption value="60">1 hour</SelectOption>
          </Select>
        </div>

        <Button
          className="w-full"
          variant="destructive"
          disabled={!selectedBranch || loading || isCrashActive}
          onClick={onTriggerCrash}
        >
          {loading ? 'Processing...' : 'Trigger Market Crash'}
        </Button>
      </CardContent>
    </Card>
  );
}
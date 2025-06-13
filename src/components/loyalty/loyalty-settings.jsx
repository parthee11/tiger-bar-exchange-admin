import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AlertCircle, Save, Check } from "lucide-react";
import { useToast } from "../ui/use-toast";
import settingsApi from "../../api/settings";
import loyaltyApi from "../../api/loyalty";
import { ErrorMessage, LoadingSpinner } from "./loyalty-components";

/**
 * LoyaltySettings component for managing loyalty program settings
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loyaltyEnabled - Whether the loyalty program is enabled
 * @param {Function} props.setLoyaltyEnabled - Function to update loyalty enabled state
 * @returns {JSX.Element} LoyaltySettings component
 */
export function LoyaltySettings({ loyaltyEnabled, setLoyaltyEnabled }) {
  const [toggleLoading, setToggleLoading] = useState(false);
  const [percentageLoading, setPercentageLoading] = useState(false);
  const [loyaltyPercentage, setLoyaltyPercentage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load loyalty percentage on component mount
  useEffect(() => {
    const fetchLoyaltyPercentage = async () => {
      try {
        setPercentageLoading(true);
        const response = await settingsApi.getLoyaltyPercentage();
        const percentage = response.data !== undefined ? response.data : 1;
        setLoyaltyPercentage(percentage);
        setError(null);
      } catch (error) {
        setError("Failed to load loyalty percentage. Using default value of 1%.");
        setLoyaltyPercentage(1);
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description: "Failed to load loyalty percentage. Using default value of 1%."
        });
      } finally {
        setPercentageLoading(false);
      }
    };
    fetchLoyaltyPercentage();
  }, [toast]);

  // Toggle loyalty program
  const handleLoyaltyToggle = async (enabled) => {
    setToggleLoading(true);
    try {
      // First try to update using the new settings API
      await settingsApi.updateLoyaltyProgramEnabled(enabled);
      setLoyaltyEnabled(enabled);
      setError(null);
      toast({
        variant: "success",
        title: "Loyalty Program Updated",
        description: enabled 
          ? "Loyalty program has been enabled successfully." 
          : "Loyalty program has been disabled successfully."
      });
    } catch (settingsError) {
      // Fallback to the old API if the new one fails
      try {
        await loyaltyApi.updateLoyaltyStatus(enabled);
        setLoyaltyEnabled(enabled);
        setError(null);
        toast({
          variant: "success",
          title: "Loyalty Program Updated",
          description: enabled 
            ? "Loyalty program has been enabled successfully." 
            : "Loyalty program has been disabled successfully."
        });
      } catch (loyaltyError) {
        setError("Failed to update loyalty status. Please try again.");
        // Revert the UI state if both API calls fail
        setLoyaltyEnabled(!enabled);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update loyalty program status. Please try again."
        });
      }
    } finally {
      setToggleLoading(false);
    }
  };

  // Update loyalty percentage
  const handlePercentageUpdate = async () => {
    setPercentageLoading(true);
    try {
      const numericPercentage = Number(loyaltyPercentage);
      if (isNaN(numericPercentage) || numericPercentage < 0 || numericPercentage > 100) {
        setError("Please enter a valid percentage between 0 and 100.");
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: "Please enter a valid percentage between 0 and 100."
        });
        setPercentageLoading(false);
        return;
      }
      
      const response = await settingsApi.updateLoyaltyPercentage(numericPercentage);
      
      // Handle different response formats
      const updatedPercentage = response.value !== undefined ? response.value : 
                              (response.percentage !== undefined ? response.percentage : numericPercentage);
      
      setLoyaltyPercentage(updatedPercentage);
      setIsEditing(false);
      setError(null);
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Loyalty percentage updated to ${updatedPercentage}%.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      setError("Failed to update loyalty percentage. Please try again.");
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update loyalty percentage. Please try again."
      });
    } finally {
      setPercentageLoading(false);
    }
  };

  // Component for loyalty program toggle
  const LoyaltyToggle = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="loyalty-toggle" className="text-base">
          Loyalty Program
        </Label>
        <p className="text-sm text-muted-foreground">
          Enable or disable the loyalty program for all customers
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {toggleLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Switch
              id="loyalty-toggle"
              checked={loyaltyEnabled}
              onCheckedChange={handleLoyaltyToggle}
              disabled={toggleLoading}
            />
            <Badge 
              variant="outline" 
              className={loyaltyEnabled 
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-yellow-100 text-yellow-800 border-yellow-300"
              }
            >
              {loyaltyEnabled ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Program Enabled
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Program Disabled
                </>
              )}
            </Badge>
          </>
        )}
      </div>
    </div>
  );

  // Component for loyalty percentage setting
  const LoyaltyPercentageSetting = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="loyalty-percentage" className="text-base">
          Loyalty Points Percentage
        </Label>
        <p className="text-sm text-muted-foreground">
          Percentage of order total awarded as loyalty points
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {percentageLoading ? (
          <LoadingSpinner size="sm" />
        ) : isEditing ? (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                id="loyalty-percentage"
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={loyaltyPercentage}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string for typing purposes
                  if (value === '') {
                    setLoyaltyPercentage('');
                  } else {
                    const numValue = parseFloat(value);
                    // Ensure the value is within valid range
                    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                      setLoyaltyPercentage(value);
                    }
                  }
                }}
                className="w-24 pr-8"
                disabled={!loyaltyEnabled}
              />
              <span className="absolute right-3 top-2 text-muted-foreground">%</span>
            </div>
            <Button
              size="sm"
              onClick={handlePercentageUpdate}
              disabled={!loyaltyEnabled || percentageLoading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={percentageLoading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {loyaltyPercentage}%
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={!loyaltyEnabled}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Program Settings</CardTitle>
        <CardDescription>
          Configure loyalty program settings and rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage message={error} />

        <div className="space-y-6">
          <LoyaltyToggle />
          <LoyaltyPercentageSetting />
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Save, Check, Clock } from "lucide-react";
import { useToast } from "../ui/use-toast";
import settingsApi from "../../api/settings";

/**
 * PricingSettings component for managing pricing-related settings
 * 
 * @returns {JSX.Element} PricingSettings component
 */
export function PricingSettings() {
  const [inactivityThreshold, setInactivityThreshold] = useState(30);
  const [checkInterval, setCheckInterval] = useState(30);
  const [lowestPriceDrop, setLowestPriceDrop] = useState(20);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [isEditingInterval, setIsEditingInterval] = useState(false);
  const [isEditingLowestDrop, setIsEditingLowestDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load pricing settings on component mount
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        setLoading(true);
        const [thresholdResponse, intervalResponse, lowestDropResponse] = await Promise.all([
          settingsApi.getPriceInactivityThreshold(),
          settingsApi.getPriceCheckInterval(),
          settingsApi.getLowestPriceDrop()
        ]);
        
        const threshold = thresholdResponse.data !== undefined ? thresholdResponse.data : 30;
        const interval = intervalResponse.data !== undefined ? intervalResponse.data : 30;
        const lowestDrop = lowestDropResponse.data !== undefined ? lowestDropResponse.data : 20;
        
        setInactivityThreshold(threshold);
        setCheckInterval(interval);
        setLowestPriceDrop(lowestDrop);
        setError(null);
      } catch (error) {
        setError("Failed to load pricing settings. Using default values.");
        setInactivityThreshold(30);
        setCheckInterval(30);
        setLowestPriceDrop(20);
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description: "Failed to load pricing settings. Using default values."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPricingSettings();
  }, [toast]);

  // Update inactivity threshold
  const handleThresholdUpdate = async () => {
    setLoading(true);
    try {
      const numericThreshold = Number(inactivityThreshold);
      if (isNaN(numericThreshold) || numericThreshold < 0 || numericThreshold % 1 !== 0) {
        setError("Please enter a valid whole number greater than or equal to 0.");
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: "Please enter a valid whole number greater than or equal to 0."
        });
        setLoading(false);
        return;
      }
      
      const response = await settingsApi.updatePriceInactivityThreshold(numericThreshold);
      
      // Handle different response formats
      const updatedThreshold = response.data?.value !== undefined ? response.data.value : numericThreshold;
      
      setInactivityThreshold(updatedThreshold);
      setIsEditingThreshold(false);
      setError(null);
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Price inactivity threshold updated to ${updatedThreshold} minutes.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update pricing settings. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Update check interval
  const handleIntervalUpdate = async () => {
    setLoading(true);
    try {
      const numericInterval = Number(checkInterval);
      if (isNaN(numericInterval) || numericInterval < 1 || numericInterval % 1 !== 0) {
        setError("Please enter a valid whole number greater than or equal to 1.");
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: "Please enter a valid whole number greater than or equal to 1."
        });
        setLoading(false);
        return;
      }
      
      const response = await settingsApi.updatePriceCheckInterval(numericInterval);
      
      // Handle different response formats
      const updatedInterval = response.data?.value !== undefined ? response.data.value : numericInterval;
      
      setCheckInterval(updatedInterval);
      setIsEditingInterval(false);
      setError(null);
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Price check interval updated to ${updatedInterval} minutes.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update pricing settings. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdInputChange = (e) => {
    const value = e.target.value;
    // Allow empty string for typing purposes
    if (value === '') {
      setInactivityThreshold('');
    } else {
      const numValue = parseInt(value, 10);
      // Ensure the value is a valid whole number >= 0
      if (!isNaN(numValue) && numValue >= 0) {
        setInactivityThreshold(value);
      }
    }
  };

  const handleIntervalInputChange = (e) => {
    const value = e.target.value;
    // Allow empty string for typing purposes
    if (value === '') {
      setCheckInterval('');
    } else {
      const numValue = parseInt(value, 10);
      // Ensure the value is a valid whole number >= 1
      if (!isNaN(numValue) && numValue >= 1) {
        setCheckInterval(value);
      }
    }
  };

  // Update lowest price drop
  const handleLowestDropUpdate = async () => {
    setLoading(true);
    try {
      const numericDrop = Number(lowestPriceDrop);
      if (isNaN(numericDrop) || numericDrop < 0) {
        setError("Please enter a valid number greater than or equal to 0.");
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: "Please enter a valid number greater than or equal to 0."
        });
        setLoading(false);
        return;
      }
      
      const response = await settingsApi.updateLowestPriceDrop(numericDrop);
      
      // Handle different response formats
      const updatedDrop = response.data?.value !== undefined ? response.data.value : numericDrop;
      
      setLowestPriceDrop(updatedDrop);
      setIsEditingLowestDrop(false);
      setError(null);
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Lowest price drop updated to ${updatedDrop} AED.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update pricing settings. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLowestDropInputChange = (e) => {
    const value = e.target.value;
    // Allow empty string for typing purposes
    if (value === '') {
      setLowestPriceDrop('');
    } else {
      const numValue = parseFloat(value);
      // Ensure the value is a valid number >= 0
      if (!isNaN(numValue) && numValue >= 0) {
        setLowestPriceDrop(value);
      }
    }
  };

  // Loading spinner component
  const LoadingSpinner = ({ size = "default" }) => (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${
      size === "sm" ? "h-4 w-4" : "h-6 w-6"
    }`} />
  );

  // Error message component
  const ErrorMessage = ({ message }) => (
    message && (
      <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
        {message}
      </div>
    )
  );

  // Component for inactivity threshold setting
  const InactivityThresholdSetting = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="inactivity-threshold" className="text-base">
          Price Inactivity Threshold
        </Label>
        <p className="text-sm text-muted-foreground">
          Number of minutes of inactivity before item prices decrease
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : isEditingThreshold ? (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                id="inactivity-threshold"
                type="number"
                min="0"
                step="1"
                value={inactivityThreshold}
                onChange={handleThresholdInputChange}
                className="w-24 pr-12"
                placeholder="30"
              />
              <span className="absolute right-3 top-2 text-muted-foreground text-sm">min</span>
            </div>
            <Button
              size="sm"
              onClick={handleThresholdUpdate}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingThreshold(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {inactivityThreshold} min
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingThreshold(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Component for check interval setting
  const CheckIntervalSetting = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="check-interval" className="text-base">
          Price Check Interval
        </Label>
        <p className="text-sm text-muted-foreground">
          Number of minutes between price checks by the scheduler
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : isEditingInterval ? (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                id="check-interval"
                type="number"
                min="1"
                step="1"
                value={checkInterval}
                onChange={handleIntervalInputChange}
                className="w-24 pr-12"
                placeholder="30"
              />
              <span className="absolute right-3 top-2 text-muted-foreground text-sm">min</span>
            </div>
            <Button
              size="sm"
              onClick={handleIntervalUpdate}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingInterval(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {checkInterval} min
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingInterval(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Component for lowest price drop setting
  const LowestPriceDropSetting = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="lowest-price-drop" className="text-base">
          Lowest Price Drop
        </Label>
        <p className="text-sm text-muted-foreground">
          Maximum amount (in AED) that prices can drop below floor price when decreasing due to inactivity
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : isEditingLowestDrop ? (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                id="lowest-price-drop"
                type="number"
                min="0"
                step="0.01"
                value={lowestPriceDrop}
                onChange={handleLowestDropInputChange}
                className="w-24 pr-12"
                placeholder="20"
              />
              <span className="absolute right-3 top-2 text-muted-foreground text-sm">AED</span>
            </div>
            <Button
              size="sm"
              onClick={handleLowestDropUpdate}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingLowestDrop(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {lowestPriceDrop} AED
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingLowestDrop(true)}
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
        <CardTitle>Pricing Settings</CardTitle>
        <CardDescription>
          Configure dynamic pricing behavior and thresholds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage message={error} />
        
        <div className="space-y-6">
          <InactivityThresholdSetting />
          <CheckIntervalSetting />
          <LowestPriceDropSetting />
        </div>
      </CardContent>
    </Card>
  );
}
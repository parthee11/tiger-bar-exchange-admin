import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Select, SelectOption } from "../ui/select";
import { Save, Check, Clock, MapPin } from "lucide-react";
import { useToast } from "../ui/use-toast";
import settingsApi from "../../api/settings";
import branchesApi from "../../api/branches";

/**
 * PricingSettings component for managing pricing-related settings
 * 
 * @returns {JSX.Element} PricingSettings component
 */
export function PricingSettings() {
  const [inactivityThreshold, setInactivityThreshold] = useState(30);
  const [checkInterval, setCheckInterval] = useState(30);
  const [lowestPriceDrop, setLowestPriceDrop] = useState(20);
  const [lowestPriceDropType, setLowestPriceDropType] = useState('value');
  const [lowestPriceDropPercentage, setLowestPriceDropPercentage] = useState(50);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [isEditingInterval, setIsEditingInterval] = useState(false);
  const [isEditingLowestDrop, setIsEditingLowestDrop] = useState(false);
  
  // Price reset time states (branch-specific)
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [priceResetTime, setPriceResetTime] = useState('00:00');
  const [isEditingResetTime, setIsEditingResetTime] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchLoading(true);
        const response = await branchesApi.getBranches();
        setBranches(response.data || []);
        
        // Select first branch by default if available
        if (response.data && response.data.length > 0) {
          setSelectedBranch(response.data[0]._id);
        }
      } catch (error) {
        console.error("Error loading branches:", error);
        toast({
          variant: "destructive",
          title: "Error loading branches",
          description: "Failed to load branches list."
        });
      } finally {
        setBranchLoading(false);
      }
    };
    fetchBranches();
  }, [toast]);

  // Load pricing settings on component mount
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        setLoading(true);
        const [
          thresholdResponse, 
          intervalResponse, 
          lowestDropResponse, 
          dropTypeResponse, 
          dropPercentageResponse
        ] = await Promise.all([
          settingsApi.getPriceInactivityThreshold(),
          settingsApi.getPriceCheckInterval(),
          settingsApi.getLowestPriceDrop(),
          settingsApi.getLowestPriceDropType(),
          settingsApi.getLowestPriceDropPercentage()
        ]);
        
        const threshold = thresholdResponse.data !== undefined ? thresholdResponse.data : 30;
        const interval = intervalResponse.data !== undefined ? intervalResponse.data : 30;
        const lowestDrop = lowestDropResponse.data !== undefined ? lowestDropResponse.data : 20;
        const dropType = dropTypeResponse.data !== undefined ? dropTypeResponse.data : 'value';
        const dropPercentage = dropPercentageResponse.data !== undefined ? dropPercentageResponse.data : 50;
        
        setInactivityThreshold(threshold);
        setCheckInterval(interval);
        setLowestPriceDrop(lowestDrop);
        setLowestPriceDropType(dropType);
        setLowestPriceDropPercentage(dropPercentage);
        setError(null);
      } catch (error) {
        setError("Failed to load pricing settings. Using default values.");
        setInactivityThreshold(30);
        setCheckInterval(30);
        setLowestPriceDrop(20);
        setLowestPriceDropType('value');
        setLowestPriceDropPercentage(50);
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

  // Load price reset time when branch changes
  useEffect(() => {
    const fetchPriceResetTime = async () => {
      if (!selectedBranch) return;
      
      try {
        const response = await settingsApi.getPriceResetTime(selectedBranch);
        const resetTime = response.data !== undefined ? response.data : '00:00';
        setPriceResetTime(resetTime);
      } catch (error) {
        console.error("Error loading price reset time:", error);
        setPriceResetTime('00:00');
        toast({
          variant: "destructive",
          title: "Error loading reset time",
          description: "Failed to load price reset time. Using default value."
        });
      }
    };
    fetchPriceResetTime();
  }, [selectedBranch, toast]);

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

  // Update lowest price drop type
  const handleLowestDropTypeUpdate = async (newType) => {
    setLoading(true);
    try {
      const response = await settingsApi.updateLowestPriceDropType(newType);
      
      // Handle different response formats
      const updatedType = response.data?.value !== undefined ? response.data.value : newType;
      
      setLowestPriceDropType(updatedType);
      setError(null);
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Lowest price drop type updated to ${updatedType === 'value' ? 'Fixed Value' : 'Percentage'}.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update price drop type. Please try again.";
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

  // Update lowest price drop percentage
  const handleLowestDropPercentageUpdate = async (newPercentage) => {
    setLoading(true);
    try {
      const numericPercentage = Number(newPercentage);
      if (isNaN(numericPercentage) || numericPercentage < 10 || numericPercentage > 90) {
        setError("Please select a percentage between 10% and 90%.");
        toast({
          variant: "destructive",
          title: "Invalid Selection",
          description: "Please select a percentage between 10% and 90%."
        });
        setLoading(false);
        return;
      }
      
      const response = await settingsApi.updateLowestPriceDropPercentage(numericPercentage);
      
      // Handle different response formats
      const updatedPercentage = response.data?.value !== undefined ? response.data.value : numericPercentage;
      
      setLowestPriceDropPercentage(updatedPercentage);
      setError(null);
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Lowest price drop percentage updated to ${updatedPercentage}%.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update price drop percentage. Please try again.";
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

  // Update price reset time
  const handlePriceResetTimeUpdate = async () => {
    if (!selectedBranch) {
      setError("Please select a branch first.");
      toast({
        variant: "destructive",
        title: "No Branch Selected",
        description: "Please select a branch first."
      });
      return;
    }

    setLoading(true);
    try {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(priceResetTime)) {
        setError("Please enter a valid time in HH:MM format.");
        toast({
          variant: "destructive",
          title: "Invalid Time Format",
          description: "Please enter a valid time in HH:MM format (24-hour)."
        });
        setLoading(false);
        return;
      }
      
      const response = await settingsApi.updatePriceResetTime(selectedBranch, priceResetTime);
      
      // Handle different response formats
      const updatedTime = response.data?.value !== undefined ? response.data.value : priceResetTime;
      
      setPriceResetTime(updatedTime);
      setIsEditingResetTime(false);
      setError(null);
      
      const selectedBranchName = branches.find(b => b._id === selectedBranch)?.name || 'Selected branch';
      toast({
        variant: "success",
        title: "Settings Updated",
        description: `Price reset time for ${selectedBranchName} updated to ${updatedTime}.`,
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update price reset time. Please try again.";
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

  const handlePriceResetTimeInputChange = (e) => {
    const value = e.target.value;
    // Allow typing but validate the format
    if (value.length <= 5) { // HH:MM format max length
      setPriceResetTime(value);
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
  const LowestPriceDropSetting = () => {
    // Generate percentage options from 10% to 90%
    const percentageOptions = [];
    for (let i = 10; i <= 90; i += 10) {
      percentageOptions.push(i);
    }

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">
              Lowest Price Drop
            </Label>
            <p className="text-sm text-muted-foreground">
              {lowestPriceDropType === 'value' 
                ? 'Maximum amount (in AED) that prices can drop below floor price'
                : 'Percentage of floor price that prices can drop below floor price'
              }
            </p>
          </div>
        </div>

        {/* Toggle between Value and Percentage */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="drop-type-toggle" className="text-sm font-medium">
            Type:
          </Label>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${lowestPriceDropType === 'value' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              Fixed Value
            </span>
            <Switch
              id="drop-type-toggle"
              checked={lowestPriceDropType === 'percentage'}
              onCheckedChange={(checked) => handleLowestDropTypeUpdate(checked ? 'percentage' : 'value')}
              disabled={loading}
            />
            <span className={`text-sm ${lowestPriceDropType === 'percentage' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              Percentage
            </span>
          </div>
        </div>

        {/* Value/Percentage Input */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">
              {lowestPriceDropType === 'value' ? 'Drop Amount' : 'Drop Percentage'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : lowestPriceDropType === 'value' ? (
              // Value input (existing functionality)
              isEditingLowestDrop ? (
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
              )
            ) : (
              // Percentage dropdown (new functionality)
              <div className="flex items-center space-x-2">
                <Select
                  value={lowestPriceDropPercentage.toString()}
                  onChange={(e) => handleLowestDropPercentageUpdate(e.target.value)}
                  disabled={loading}
                  className="w-24"
                >
                  {percentageOptions.map((percent) => (
                    <SelectOption key={percent} value={percent.toString()}>
                      {percent}%
                    </SelectOption>
                  ))}
                </Select>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {lowestPriceDropPercentage}%
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Helper text based on type */}
        <div className="text-xs text-muted-foreground">
          {lowestPriceDropType === 'value' ? (
            <>Example: If floor price is 50 AED and drop is {lowestPriceDrop} AED, minimum price will be {Math.max(0, 50 - lowestPriceDrop)} AED</>
          ) : (
            <>Example: If floor price is 50 AED and drop is {lowestPriceDropPercentage}%, minimum price will be {Math.max(0, 50 - (50 * lowestPriceDropPercentage / 100))} AED</>
          )}
        </div>
      </div>
    );
  };

  // Component for price reset time setting (branch-specific)
  const PriceResetTimeSetting = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">
            Daily Price Reset Time
          </Label>
          <p className="text-sm text-muted-foreground">
            Set the time when market prices reset to their original values (branch-specific)
          </p>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="flex items-center space-x-4">
        <Label htmlFor="branch-selector" className="text-sm font-medium min-w-fit">
          Branch:
        </Label>
        <div className="flex-1">
          <Select
            id="branch-selector"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={branchLoading}
            className="w-full max-w-xs"
          >
            <SelectOption value="">Select a branch</SelectOption>
            {branches.map((branch) => (
              <SelectOption key={branch._id} value={branch._id}>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {branch.name}
                </div>
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      {/* Time Input */}
      {selectedBranch && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reset-time" className="text-sm font-medium">
              Reset Time
            </Label>
            <p className="text-xs text-muted-foreground">
              Time in 24-hour format (HH:MM)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : isEditingResetTime ? (
              <div className="flex items-center space-x-2">
                <Input
                  id="reset-time"
                  type="time"
                  value={priceResetTime}
                  onChange={handlePriceResetTimeInputChange}
                  className="w-32"
                  placeholder="00:00"
                />
                <Button
                  size="sm"
                  onClick={handlePriceResetTimeUpdate}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingResetTime(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {priceResetTime}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingResetTime(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper text */}
      {selectedBranch && (
        <div className="text-xs text-muted-foreground">
          Prices will reset to their original values daily at {priceResetTime} for {branches.find(b => b._id === selectedBranch)?.name || 'selected branch'}.
        </div>
      )}
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
          <PriceResetTimeSetting />
        </div>
      </CardContent>
    </Card>
  );
}
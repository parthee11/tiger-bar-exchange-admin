import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { AlertCircle, Check, CreditCard } from "lucide-react";
import { useToast } from "../ui/use-toast";
import settingsApi from "../../api/settings";

/**
 * PaymentSettings component for managing payment method settings
 */
export function PaymentSettings() {
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load online payment enabled status on component mount
  useEffect(() => {
    const fetchOnlinePaymentStatus = async () => {
      try {
        setIsLoading(true);
        const response = await settingsApi.getOnlinePaymentEnabled();
        const enabled = response.data !== undefined ? response.data : true;
        setOnlinePaymentEnabled(enabled);
        setError(null);
      } catch (error) {
        console.error("Error loading online payment status:", error);
        setError("Failed to load payment settings. Using default value (enabled).");
        setOnlinePaymentEnabled(true);
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description: "Failed to load payment settings. Using default value (enabled)."
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnlinePaymentStatus();
  }, [toast]);

  // Toggle online payment
  const handleOnlinePaymentToggle = async (enabled) => {
    setToggleLoading(true);
    try {
      await settingsApi.updateOnlinePaymentEnabled(enabled);
      setOnlinePaymentEnabled(enabled);
      setError(null);
      toast({
        variant: "success",
        title: "Payment Settings Updated",
        description: enabled 
          ? "Online payment has been enabled. Customers can now pay via Stripe." 
          : "Online payment has been disabled. Customers can only pay at the counter."
      });
    } catch (error) {
      console.error("Error updating online payment status:", error);
      setError("Failed to update payment settings. Please try again.");
      // Revert the UI state if the API call fails
      setOnlinePaymentEnabled(!enabled);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update payment settings. Please try again."
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700">{message}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Settings</CardTitle>
          <CardDescription>
            Configure payment methods available to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method Settings</CardTitle>
        <CardDescription>
          Configure payment methods available to customers at checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage message={error} />

        <div className="space-y-6">
          {/* Online Payment Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <Label className="text-base cursor-pointer">
                  Online Payment (Stripe)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {onlinePaymentEnabled 
                  ? "Customers can pay using Stripe during checkout"
                  : "Customers can only pay at the counter"
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {toggleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : (
                <>
                  <Switch
                    checked={onlinePaymentEnabled}
                    onCheckedChange={handleOnlinePaymentToggle}
                    disabled={toggleLoading}
                  />
                  <Badge 
                    variant="outline" 
                    className={onlinePaymentEnabled 
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }
                  >
                    {onlinePaymentEnabled ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Disabled
                      </>
                    )}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> When online payment is disabled, customers will only see the "Pay at Counter" option during checkout. They will still be able to place orders and pay in person.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
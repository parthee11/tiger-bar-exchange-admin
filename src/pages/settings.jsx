import { useState, useEffect } from "react";
import { LoyaltySettings } from "../components/loyalty/loyalty-settings";
import { PricingSettings } from "../components/pricing/pricing-settings";
import { TVScreenSettings } from "../components/tv-screen/tv-screen-settings";
import { PaymentSettings } from "../components/payment/payment-settings";
import { LoadingSpinner } from "../components/loyalty/loyalty-components";
import { useToast } from "../components/ui/use-toast";
import settingsApi from "../api/settings";

export function Settings() {
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);
  const { toast } = useToast();

  // Load loyalty program status on component mount
  useEffect(() => {
    const fetchLoyaltyStatus = async () => {
      try {
        setLoyaltyLoading(true);
        const response = await settingsApi.getLoyaltyProgramEnabled();
        const enabled = response.enabled !== undefined ? response.enabled : true;
        setLoyaltyEnabled(enabled);
      } catch (error) {
        console.error("Error loading loyalty status:", error);
        setLoyaltyEnabled(true);
        toast({
          variant: "destructive",
          title: "Error loading settings",
          description: "Failed to load loyalty program status. Using default value."
        });
      } finally {
        setLoyaltyLoading(false);
      }
    };
    fetchLoyaltyStatus();
  }, [toast]);

  if (loyaltyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          System settings and configuration
        </p>
      </div>
      
      <div className="space-y-6">
        <PaymentSettings />
        <LoyaltySettings 
          loyaltyEnabled={loyaltyEnabled}
          setLoyaltyEnabled={setLoyaltyEnabled}
        />
        <PricingSettings />
        <TVScreenSettings />
      </div>
    </div>
  )
}
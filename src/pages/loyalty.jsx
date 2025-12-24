import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";
import loyaltyApi from "../api/loyalty";
import settingsApi from "../api/settings";
import { LoyaltySettings } from "../components/loyalty/loyalty-settings";
import { LoyaltyUsersTable } from "../components/loyalty/loyalty-users-table";

/**
 * Loyalty page component for managing loyalty program settings and users
 * 
 * @returns {JSX.Element} Loyalty page component
 */
export function Loyalty() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const { toast } = useToast();

  // Load loyalty program status on component mount
  useEffect(() => {
    const fetchLoyaltyStatus = async () => {
      try {
        // First try to get the status from the new settings API
        const settingsResponse = await settingsApi.getLoyaltyProgramEnabled();
        
        // Handle different response formats
        const isEnabled = settingsResponse.enabled !== undefined ? settingsResponse.enabled : 
                         (settingsResponse.value !== undefined ? settingsResponse.value : true);
        
        setLoyaltyEnabled(isEnabled);
      } catch (settingsError) {
        // Fallback to the old API if the new one fails
        try {
          const status = await loyaltyApi.getLoyaltyStatus();
          const isEnabled = status.enabled !== undefined ? status.enabled : true;
          setLoyaltyEnabled(isEnabled);
        } catch (loyaltyError) {
          // Default to enabled if there's an error
          setLoyaltyEnabled(true);
          toast({
            variant: "destructive",
            title: "Error Loading Status",
            description: "Failed to load loyalty program status. Using default settings."
          });
        }
      }
    };
    fetchLoyaltyStatus();
  }, [toast]);

  // Load users with role "user" on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await loyaltyApi.getLoyaltyCustomers();
        
        // Map the response data to match our component's expected format
        const formattedUsers = response.data.map(user => ({
          id: user._id,
          _id: user._id, // Keep the original _id for API calls
          name: user.name,
          email: user.email,
          phone: user.phone,
          points: user.loyaltyPoints || 0,
          role: user.role,
          lastLogin: user.updatedAt,
          createdAt: user.createdAt
        }));
        
        setUsers(formattedUsers);
        setError(null);
      } catch (error) {
        setError("Failed to load users. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error Loading Users",
          description: "Failed to load loyalty users. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle users update from child component
  const handleUsersUpdate = (updatedUsers) => {
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Settings</h1>
        <p className="text-muted-foreground">
          Manage loyalty program and user rewards
        </p>
      </div>
      
      <LoyaltySettings 
        loyaltyEnabled={loyaltyEnabled} 
        setLoyaltyEnabled={setLoyaltyEnabled} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program Users</CardTitle>
          <CardDescription>
            Manage user rewards and loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoyaltyUsersTable 
            users={users} 
            loading={loading} 
            error={error} 
            loyaltyEnabled={loyaltyEnabled}
            onUsersUpdate={handleUsersUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
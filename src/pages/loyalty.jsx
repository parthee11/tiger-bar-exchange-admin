import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Search, Award, Gift, Plus, Minus, Edit, Save, AlertCircle } from "lucide-react"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "../components/ui/dialog"
// Import auth context
import { useAuth } from "../contexts/auth-context"
// Import APIs
import loyaltyApi from "../api/loyalty"
import settingsApi from "../api/settings"

export function Loyalty() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [pointsAmount, setPointsAmount] = useState("")
  const [pointsReason, setPointsReason] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  
  // Get auth context with fallback for testing
  const { user } = useAuth() || { user: null }

  // Load loyalty program status on component mount
  useEffect(() => {
    const fetchLoyaltyStatus = async () => {
      try {
        // First try to get the status from the new settings API
        const settingsResponse = await settingsApi.getLoyaltyProgramEnabled();
        setLoyaltyEnabled(settingsResponse.enabled);
      } catch (settingsError) {
        console.error("Failed to fetch loyalty status from settings API:", settingsError);
        
        // Fallback to the old API if the new one fails
        try {
          const status = await loyaltyApi.getLoyaltyStatus();
          setLoyaltyEnabled(status.enabled);
        } catch (loyaltyError) {
          console.error("Failed to fetch loyalty status from loyalty API:", loyaltyError);
          // Default to enabled if there's an error
          setLoyaltyEnabled(true);
        }
      }
    };
    fetchLoyaltyStatus();
  }, []);

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
        console.error("Failed to fetch users:", error);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle points update - adding points
  const handlePointsUpdate = async () => {
    if (!selectedUser || !pointsAmount || isNaN(parseInt(pointsAmount))) return
    
    const points = parseInt(pointsAmount)
    
    try {
      // Call API to update points
      const response = await loyaltyApi.addPoints(selectedUser._id, { 
        amount: points, 
        reason: pointsReason || 'Admin adjustment'
      });
      
      // Get the updated loyalty points from the response
      const updatedPoints = response.data?.loyaltyPoints || (selectedUser.points + points);
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            points: updatedPoints
          }
        }
        return user
      });
      
      setUsers(updatedUsers);
      
      // Reset form
      setPointsAmount("");
      setPointsReason("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update points:", error);
      alert("Failed to update points. Please try again.");
    }
  }

  // Toggle loyalty program
  const handleLoyaltyToggle = async (enabled) => {
    setToggleLoading(true);
    try {
      // First try to update using the new settings API
      await settingsApi.updateLoyaltyProgramEnabled(enabled);
      setLoyaltyEnabled(enabled);
    } catch (settingsError) {
      console.error("Failed to update loyalty status with settings API:", settingsError);
      
      // Fallback to the old API if the new one fails
      try {
        await loyaltyApi.updateLoyaltyStatus(enabled);
        setLoyaltyEnabled(enabled);
      } catch (loyaltyError) {
        console.error("Failed to update loyalty status with loyalty API:", loyaltyError);
        alert("Failed to update loyalty status. Please try again.");
        // Revert the UI state if both API calls fail
        setLoyaltyEnabled(!enabled);
      }
    } finally {
      setToggleLoading(false);
    }
  }

  // Open dialog for adding points
  const openPointsDialog = (user) => {
    setSelectedUser(user)
    setPointsAmount("")
    setPointsReason("")
    setIsDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loyalty Settings</h1>
          <p className="text-muted-foreground">
            Manage loyalty program and user rewards
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="loyalty-toggle" className="font-medium">
              Loyalty Program
            </Label>
            {toggleLoading ? (
              <div className="ml-2 animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              <Switch 
                id="loyalty-toggle" 
                checked={loyaltyEnabled} 
                onCheckedChange={handleLoyaltyToggle}
                disabled={toggleLoading}
              />
            )}
          </div>
          {!loyaltyEnabled && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Program Disabled
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search users by name, email or phone..."
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setSearchTerm("")}>Clear</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program Users</CardTitle>
          <CardDescription>
            Manage user rewards and loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-sm">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Email</th>
                    <th className="p-3 text-left font-medium">Phone</th>
                    <th className="p-3 text-left font-medium">Last Updated</th>
                    <th className="p-3 text-left font-medium">Points</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-3 font-medium">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.phone || 'N/A'}</td>
                      <td className="p-3 text-sm">{formatDate(user.lastLogin)}</td>
                      <td className="p-3">{user.points}</td>
                      <td className="p-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => openPointsDialog(user)}
                          disabled={!loyaltyEnabled}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Points
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-muted-foreground">
                        {searchTerm ? 'No users found matching your search criteria' : 'No users found in the system'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Loyalty Points</DialogTitle>
            <DialogDescription>
              {selectedUser && `Add points for ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="points-amount">Points to Add</Label>
              <Input 
                id="points-amount" 
                placeholder="Enter points amount" 
                type="number"
                min="1"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="points-reason">Reason (Optional)</Label>
              <Textarea 
                id="points-reason" 
                placeholder="Enter reason for adding points"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handlePointsUpdate}
              disabled={!pointsAmount || isNaN(parseInt(pointsAmount)) || parseInt(pointsAmount) < 1}
              className="flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
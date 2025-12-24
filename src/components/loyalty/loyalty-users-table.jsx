import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, User, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import loyaltyApi from "../../api/loyalty";
import { ErrorMessage, LoadingSpinner, SearchInput, EmptyState } from "./loyalty-components";

/**
 * LoyaltyUsersTable component for displaying and managing loyalty users
 * 
 * @param {Object} props - Component props
 * @param {Array} props.users - Initial users data
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 * @param {boolean} props.loyaltyEnabled - Whether loyalty program is enabled
 * @param {Function} props.onUsersUpdate - Function to call when users are updated
 * @returns {JSX.Element} LoyaltyUsersTable component
 */
export function LoyaltyUsersTable({ users: initialUsers, loading, error, loyaltyEnabled, onUsersUpdate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();
  
  // Update users when initialUsers changes
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open dialog for adding points
  const openPointsDialog = (user) => {
    setSelectedUser(user);
    setPointsAmount("");
    setPointsReason("");
    setIsDialogOpen(true);
  };

  // Handle points update - adding points
  const handlePointsUpdate = async () => {
    if (!selectedUser || !pointsAmount || isNaN(parseInt(pointsAmount))) return;
    
    const points = parseInt(pointsAmount);
    setUpdateLoading(true);
    
    try {
      // Call API to update points
      const response = await loyaltyApi.addPoints(selectedUser._id, { 
        amount: points, 
        reason: pointsReason || 'Admin adjustment'
      });
      
      // Get the updated loyalty points from the response
      const updatedPoints = response.data?.data?.loyaltyPoints || (selectedUser.points + points);
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            points: updatedPoints
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      // Notify parent component about the update
      if (onUsersUpdate) {
        onUsersUpdate(updatedUsers);
      }
      
      // Show success toast
      toast({
        variant: "success",
        title: "Points Added",
        description: `${points} points added to ${selectedUser.name}'s account.`
      });
      
      // Reset form
      setPointsAmount("");
      setPointsReason("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Add Points",
        description: "There was an error adding points. Please try again."
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // User table component
  const UsersTable = () => (
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
  );

  // Points dialog component
  const PointsDialog = () => (
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
            <Button variant="outline" disabled={updateLoading}>Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handlePointsUpdate}
            disabled={!pointsAmount || isNaN(parseInt(pointsAmount)) || parseInt(pointsAmount) < 1 || updateLoading}
            className="flex items-center gap-1"
          >
            {updateLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add Points
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <SearchInput 
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm("")}
        placeholder="Search users by name, email or phone..."
      />

      <ErrorMessage message={error} />
      
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filteredUsers.length === 0 && !searchTerm ? (
        <EmptyState 
          icon={<Users className="h-6 w-6 text-blue-700" />}
          title="No Users Found"
          description="There are no users in the loyalty program yet."
        />
      ) : (
        <UsersTable />
      )}

      <PointsDialog />
    </>
  );
}
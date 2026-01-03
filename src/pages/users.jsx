import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Edit, Gift } from 'lucide-react';
import usersApi from '../api/users';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import UserTable from '../components/users/user-table';
import { LoyaltyPointsDialog, CouponDialog } from '../components/users/user-dialogs';

const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center">
      <div className="animate-spin">
        <RefreshCw className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export function Users() {
  useAuth();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [loyaltyAmount, setLoyaltyAmount] = useState('');
  const [loyaltyReason, setLoyaltyReason] = useState('Admin adjustment');
  const [isUpdatingCoupon, setIsUpdatingCoupon] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setError(null);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users. Please try again.',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    document.title = 'User Management | Tiger Bar Exchange';
    return () => {
      document.title = 'Tiger Bar Exchange Admin';
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleOpenLoyaltyDialog = (user) => {
    setSelectedUser(user);
    setLoyaltyAmount('');
    setLoyaltyReason('Admin adjustment');
    setLoyaltyDialogOpen(true);
  };

  const handleCloseLoyaltyDialog = () => {
    setLoyaltyDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenCouponDialog = (user) => {
    setSelectedUser(user);
    setCouponDialogOpen(true);
  };

  const handleCloseCouponDialog = () => {
    setCouponDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateCouponStatus = async (couponData) => {
    if (!selectedUser) {
      setError('No user selected');
      return;
    }

    setIsUpdatingCoupon(true);
    try {
      const response = await usersApi.updateCoupons(selectedUser._id, couponData.coupons);

      // Also update signupReward if it was changed
      if (couponData.signupReward) {
        await usersApi.updateSignupReward(selectedUser._id, couponData.signupReward);
      }

      if (response.success) {
        fetchUsers();
        handleCloseCouponDialog();
        setError(null);
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Coupons updated successfully',
        });
      } else {
        const errorMsg = response.message || 'Failed to update coupons';
        setError(errorMsg);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMsg,
        });
      }
    } catch (error) {
      console.error('Error updating coupons:', error);
      const errorMsg = error.message || 'Failed to update coupons';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setIsUpdatingCoupon(false);
    }
  };

  const handleUpdateLoyaltyPoints = async () => {
    if (!selectedUser || !loyaltyAmount) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseInt(loyaltyAmount);
      if (isNaN(amount)) {
        setError('Please enter a valid number');
        return;
      }

      const response = await usersApi.updateLoyaltyPoints(selectedUser._id, {
        amount,
        reason: loyaltyReason,
        operation: 'add',
      });

      if (response.success) {
        fetchUsers();
        handleCloseLoyaltyDialog();
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Loyalty points updated successfully',
        });
      } else {
        setError(response.message || 'Failed to update loyalty points');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to update loyalty points',
        });
      }
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      setError(error.message || 'Failed to update loyalty points');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update loyalty points',
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    return matchesSearch && user.role !== 'admin';
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Users
          </Button>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user logins, loyalty points, and coupons
            </CardDescription>
          </CardHeader>

          <UserTable
            users={currentUsers}
            loading={loading}
            onLoyaltyClick={handleOpenLoyaltyDialog}
            onCouponClick={handleOpenCouponDialog}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </Card>
      </div>

      <LoyaltyPointsDialog
        open={loyaltyDialogOpen}
        onOpenChange={setLoyaltyDialogOpen}
        user={selectedUser}
        amount={loyaltyAmount}
        onAmountChange={setLoyaltyAmount}
        reason={loyaltyReason}
        onReasonChange={setLoyaltyReason}
        onSubmit={handleUpdateLoyaltyPoints}
      />

      <CouponDialog
        open={couponDialogOpen}
        onOpenChange={setCouponDialogOpen}
        user={selectedUser}
        onStatusChange={handleUpdateCouponStatus}
        isUpdating={isUpdatingCoupon}
      />
    </>
  );
}

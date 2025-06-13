import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Edit, Trash2, MapPin, Phone, Store, Table, Loader2 } from 'lucide-react';
import { branchesApi } from '../api/api';
import apiClient from '../api/index';
import { useConfirmationDialog } from '../components/providers/confirmation-provider';
import { useToast } from '../components/ui/use-toast';

// Branch Card Component
const BranchCard = ({ branch, onEdit, onDelete, onToggleStatus, onViewTables, actionLoading }) => (
    <Card key={branch._id || branch.id} className="overflow-hidden border-muted/40 hover:border-muted/80 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center">
              {branch.name}
              <button
                onClick={() => onToggleStatus(branch)}
                className={`ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium cursor-pointer transition-colors ${
                  branch.isActive
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
                title={branch.isActive ? 'Click to deactivate' : 'Click to activate'}
              >
                {branch.isActive ? 'Active' : 'Inactive'}
              </button>
            </CardTitle>
            <div className="flex items-center mt-1 gap-2">
              <button
                onClick={(e) => onViewTables(branch, e)}
                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 cursor-pointer hover:bg-blue-100 transition-colors"
                title="View tables"
              >
                <Table className="h-3 w-3 mr-1" />
                {branch.numberOfTables || 0} Tables
              </button>
            </div>
          </div>
        </div>
        <CardDescription className="flex items-center mt-2 text-xs">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{branch.address}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="text-muted-foreground">{branch.contactNumber}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onEdit(branch)}
            disabled={actionLoading}
          >
            <Edit className="h-3 w-3" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(branch)}
            disabled={actionLoading}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

// Branch Form Component
const BranchForm = ({ formData, error, actionLoading, onInputChange, onCheckboxChange, onSubmit, onCancel, submitButtonText }) => {
  const idPrefix = submitButtonText.toLowerCase().includes('add') ? '' : 'edit-';

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}name`}>Branch Name <span className="text-red-500">*</span></Label>
          <Input
            id={`${idPrefix}name`}
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Enter branch name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}address`}>Address <span className="text-red-500">*</span></Label>
          <Input
            id={`${idPrefix}address`}
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="Enter branch address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}contactNumber`}>Contact Number <span className="text-red-500">*</span></Label>
          <Input
            id={`${idPrefix}contactNumber`}
            name="contactNumber"
            value={formData.contactNumber}
            onChange={onInputChange}
            placeholder="Enter contact number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}numberOfTables`}>Number of Tables</Label>
          <Input
            id={`${idPrefix}numberOfTables`}
            name="numberOfTables"
            type="number"
            value={formData.numberOfTables}
            onChange={onInputChange}
            placeholder="Enter number of tables"
            min="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${idPrefix}isActive`}
            checked={formData.isActive}
            onCheckedChange={(checked) => onCheckboxChange(checked, 'isActive')}
          />
          <Label htmlFor={`${idPrefix}isActive`} className="cursor-pointer">Active</Label>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={actionLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {submitButtonText.includes('Add') ? 'Adding...' : 'Updating...'}
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

// Tables Modal Component
const TablesModal = ({ isOpen, onOpenChange, currentBranch, selectedTables, loading, onClose }) => (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Tables at {currentBranch?.name}</DialogTitle>
          <DialogDescription>
            View and manage tables for this branch
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-auto my-4 pr-2 -mr-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading tables...</span>
            </div>
          ) : selectedTables.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
              <Table className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="text-muted-foreground">No tables available for this branch.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Tables will be displayed here once they are added to this branch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {selectedTables.map((table) => (
                <div
                  key={table.id || table._id}
                  className={`p-3 rounded-lg flex flex-col items-center justify-center aspect-square shadow-sm border ${
                    table.status === 'available' ? 'bg-green-50 border-green-200' :
                    table.status === 'occupied' ? 'bg-red-50 border-red-200' :
                    table.status === 'reserved' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Table className={`h-6 w-6 mb-2 ${
                    table.status === 'available' ? 'text-green-600' :
                    table.status === 'occupied' ? 'text-red-600' :
                    table.status === 'reserved' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                  <span className="font-medium text-sm">{table.number || table.tableNumber}</span>
                  <span className="text-xs capitalize mt-1">{table.status || 'unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

// Main Branches Component
export function Branches() {
  // State for branches data
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTablesModalOpen, setIsTablesModalOpen] = useState(false);

  // Current branch and tables
  const [currentBranch, setCurrentBranch] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    numberOfTables: 0,
    isActive: true,
  });

  // Hooks
  const { openConfirmation } = useConfirmationDialog();
  const { toast } = useToast();

  // Fetch branches (memoized with useCallback)
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchesApi.getBranches();
      
      // Process branches to ensure numberOfTables is set correctly
      const processedBranches = await Promise.all(data.data.map(async (branch) => {
        // If numberOfTables is already set and greater than 0, use it
        if (branch.numberOfTables && branch.numberOfTables > 0) {
          return branch;
        }
        
        try {
          // Try to fetch tables count from the API
          const tablesResponse = await apiClient.get(`/branches/${branch._id}/tables`);
          if (tablesResponse.data && tablesResponse.data.data) {
            return {
              ...branch,
              numberOfTables: tablesResponse.data.data.length
            };
          }
        } catch (error) {
          console.error(`Error fetching tables for branch ${branch._id}:`, error);
          // If there's an error, don't modify the branch
        }
        
        return branch;
      }));
      
      setBranches(processedBranches);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load branches. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch all branches on component mount
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Branch name is required.');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Branch address is required.');
      return false;
    }
    if (!formData.contactNumber.trim()) {
      setError('Contact number is required.');
      return false;
    }
    return true;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCheckboxChange = (checked, name) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      contactNumber: '',
      numberOfTables: 0,
      isActive: true,
    });
    setCurrentBranch(null);
    setSelectedTables([]);
    setError(null);
  };

  // Modal handlers
  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (branch) => {
    setCurrentBranch(branch);
    setError(null);
    setFormData({
      name: branch.name || '',
      address: branch.address || '',
      contactNumber: branch.contactNumber || '',
      numberOfTables: branch.numberOfTables || 0,
      isActive: branch.isActive !== undefined ? branch.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  const openTablesModal = async (branch, e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    setCurrentBranch(branch);
    setSelectedTables([]);
    setIsTablesModalOpen(true);
    setTablesLoading(true);
    
    try {
      // Fetch tables for this branch
      const response = await apiClient.get(`/branches/${branch._id}/tables`);
      if (response.data && response.data.data) {
        setSelectedTables(response.data.data);
      } else {
        // Create dummy tables based on numberOfTables if API doesn't return any
        if (branch.numberOfTables && branch.numberOfTables > 0) {
          const dummyTables = Array.from({ length: branch.numberOfTables }, (_, i) => ({
            _id: `dummy-${i}`,
            tableNumber: i + 1,
            status: 'available',
          }));
          setSelectedTables(dummyTables);
        }
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      toast({
        title: 'Error',
        description: 'Failed to load tables. Please try again.',
        variant: 'destructive',
      });
      
      // Create dummy tables based on numberOfTables if API fails
      if (branch.numberOfTables && branch.numberOfTables > 0) {
        const dummyTables = Array.from({ length: branch.numberOfTables }, (_, i) => ({
          _id: `dummy-${i}`,
          tableNumber: i + 1,
          status: 'available',
        }));
        setSelectedTables(dummyTables);
      }
    } finally {
      setTablesLoading(false);
    }
  };

  // CRUD operations
  const handleAddBranch = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    setError(null);

    try {
      // Ensure numberOfTables is a positive integer
      const numTables = parseInt(formData.numberOfTables);
      
      const newBranchData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        contactNumber: formData.contactNumber.trim(),
        numberOfTables: numTables > 0 ? numTables : 0,
        isActive: formData.isActive,
      };

      const response = await branchesApi.createBranch(newBranchData);
      setIsAddModalOpen(false);
      resetForm();
      
      // If tables were specified, create them automatically
      if (numTables > 0 && response.data && response.data._id) {
        try {
          // Create tables in parallel
          await Promise.all(
            Array.from({ length: numTables }, (_, i) => 
              apiClient.post(`/branches/${response.data._id}/tables`, {
                tableNumber: i + 1,
                status: 'available',
                capacity: 4 // Default capacity
              })
            )
          );
        } catch (tableErr) {
          console.error('Error creating tables:', tableErr);
          // Continue even if table creation fails
        }
      }
      
      fetchBranches();

      toast({
        title: 'Success',
        description: 'Branch added successfully.',
        variant: 'success',
      });
    } catch (err) {
      console.error('Error adding branch:', err);
      setError('Failed to add branch. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to add branch. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBranch = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    setError(null);

    try {
      // Ensure numberOfTables is a positive integer
      const numTables = parseInt(formData.numberOfTables);
      const oldNumTables = parseInt(currentBranch.numberOfTables) || 0;
      
      const updatedBranchData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        contactNumber: formData.contactNumber.trim(),
        numberOfTables: numTables > 0 ? numTables : 0,
        isActive: formData.isActive,
      };

      await branchesApi.updateBranch(currentBranch._id, updatedBranchData);
      
      // If the number of tables has increased, create the additional tables
      if (numTables > oldNumTables) {
        try {
          // Get existing tables to determine the next table number
          const tablesResponse = await apiClient.get(`/branches/${currentBranch._id}/tables`);
          const existingTables = tablesResponse.data?.data || [];
          const startTableNumber = existingTables.length > 0 
            ? Math.max(...existingTables.map(t => parseInt(t.tableNumber || t.number) || 0)) + 1 
            : 1;
          
          // Create new tables starting from the next available number
          await Promise.all(
            Array.from({ length: numTables - oldNumTables }, (_, i) => 
              apiClient.post(`/branches/${currentBranch._id}/tables`, {
                tableNumber: startTableNumber + i,
                status: 'available',
                capacity: 4 // Default capacity
              })
            )
          );
        } catch (tableErr) {
          console.error('Error creating additional tables:', tableErr);
          // Continue even if table creation fails
        }
      }
      
      setIsEditModalOpen(false);
      resetForm();
      fetchBranches();

      toast({
        title: 'Success',
        description: 'Branch updated successfully.',
        variant: 'success',
      });
    } catch (err) {
      console.error('Error updating branch:', err);
      setError('Failed to update branch. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update branch. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (branch) => {
    openConfirmation({
      title: 'Delete Branch',
      message: `Are you sure you want to delete ${branch.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await branchesApi.deleteBranch(branch._id);
          fetchBranches();
          toast({
            title: 'Success',
            description: 'Branch deleted successfully.',
            variant: 'success',
          });
        } catch (err) {
          console.error('Error deleting branch:', err);
          setError('Failed to delete branch. Please try again.');
          toast({
            title: 'Error',
            description: 'Failed to delete branch. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const toggleBranchStatus = (branch) => {
    openConfirmation({
      title: `${branch.isActive ? 'Deactivate' : 'Activate'} Branch`,
      message: `Are you sure you want to ${branch.isActive ? 'deactivate' : 'activate'} ${branch.name}?`,
      confirmText: branch.isActive ? 'Deactivate' : 'Activate',
      cancelText: 'Cancel',
      confirmVariant: branch.isActive ? 'destructive' : 'default',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const updatedBranchData = {
            ...branch,
            isActive: !branch.isActive,
          };

          await branchesApi.updateBranch(branch._id, updatedBranchData);
          fetchBranches();

          toast({
            title: 'Success',
            description: `Branch ${branch.isActive ? 'deactivated' : 'activated'} successfully.`,
            variant: 'success',
          });
        } catch (err) {
          console.error('Error updating branch status:', err);
          setError('Failed to update branch status. Please try again.');
          toast({
            title: 'Error',
            description: 'Failed to update branch status. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage your business locations and tables
          </p>
        </div>
        <Button
          className="flex items-center gap-1"
          onClick={openAddModal}
          disabled={actionLoading}
        >
          <Plus className="h-4 w-4" /> Add Branch
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Content area */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading branches...</span>
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-lg border border-dashed">
          <div className="mb-4 text-muted">
            <Store className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium">No branches found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Branches represent your physical business locations. Add your first branch to get started.
          </p>
          <Button className="mt-6" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Branch
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard
              key={branch._id || branch.id}
              branch={branch}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onToggleStatus={toggleBranchStatus}
              onViewTables={openTablesModal}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch for your business
            </DialogDescription>
          </DialogHeader>

          <BranchForm
            formData={formData}
            error={error}
            actionLoading={actionLoading}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            onSubmit={handleAddBranch}
            onCancel={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            submitButtonText="Add Branch"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch information
            </DialogDescription>
          </DialogHeader>

          <BranchForm
            formData={formData}
            error={error}
            actionLoading={actionLoading}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            onSubmit={handleEditBranch}
            onCancel={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}
            submitButtonText="Update Branch"
          />
        </DialogContent>
      </Dialog>

      {/* Tables Modal */}
      <TablesModal
        isOpen={isTablesModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsTablesModalOpen(false);
            setSelectedTables([]);
          }
        }}
        currentBranch={currentBranch}
        selectedTables={selectedTables}
        loading={tablesLoading}
        onClose={() => {
          setIsTablesModalOpen(false);
          setSelectedTables([]);
        }}
      />
    </div>
  );
}

export default Branches;

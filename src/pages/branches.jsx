import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Plus, Edit, Trash2, MapPin, Phone, Store, Table } from "lucide-react";
import { branchesApi } from "../api/api";
import { useConfirmationDialog } from "../components/providers/confirmation-provider";

export function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTablesModalOpen, setIsTablesModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    numberOfTables: 0,
    isActive: true
  });
  const { openConfirmation } = useConfirmationDialog();

  // Fetch all branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesApi.getBranches();
      setBranches(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to load branches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.contactNumber) {
        setError("Branch name, address, and contact number are required.");
        return;
      }
      
      const newBranchData = {
        name: formData.name,
        address: formData.address,
        contactNumber: formData.contactNumber,
        numberOfTables: formData.numberOfTables,
        isActive: formData.isActive
      };
      
      await branchesApi.createBranch(newBranchData);
      setIsAddModalOpen(false);
      resetForm();
      fetchBranches();
      setError(null);
    } catch (err) {
      console.error("Error adding branch:", err);
      setError("Failed to add branch. Please try again.");
    }
  };

  const handleEditBranch = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.contactNumber) {
        setError("Branch name, address, and contact number are required.");
        return;
      }
      
      const updatedBranchData = {
        name: formData.name,
        address: formData.address,
        contactNumber: formData.contactNumber,
        numberOfTables: formData.numberOfTables,
        isActive: formData.isActive
      };
      
      await branchesApi.updateBranch(currentBranch._id, updatedBranchData);
      setIsEditModalOpen(false);
      resetForm();
      fetchBranches();
      setError(null);
    } catch (err) {
      console.error("Error updating branch:", err);
      setError("Failed to update branch. Please try again.");
    }
  };

  const openDeleteModal = (branch) => {
    openConfirmation({
      title: "Delete Branch",
      message: `Are you sure you want to delete ${branch.name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          await branchesApi.deleteBranch(branch._id);
          fetchBranches();
          setError(null);
        } catch (err) {
          console.error("Error deleting branch:", err);
          setError("Failed to delete branch. Please try again.");
        }
      }
    });
  };

  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (branch) => {
    setCurrentBranch(branch);
    setError(null);
    setFormData({
      name: branch.name,
      address: branch.address,
      contactNumber: branch.contactNumber || "",
      numberOfTables: branch.numberOfTables || 0,
      isActive: branch.isActive
    });
    setIsEditModalOpen(true);
  };
  
  const openTablesModal = (branch, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setCurrentBranch(branch);
    setSelectedTables(branch.tables || []);
    setIsTablesModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      contactNumber: "",
      numberOfTables: 0,
      isActive: true
    });
    setCurrentBranch(null);
    setSelectedTables([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Use branches data from API
  const displayBranches = branches;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage your business branches
          </p>
        </div>
        <Button className="flex items-center gap-1" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Add Branch
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <p>Loading branches...</p>
        </div>
      ) : displayBranches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-gray-400">
            <Store className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium">No branches found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Get started by adding your first branch.
          </p>
          <Button className="mt-4" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Branch
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayBranches.map((branch) => (
            <Card key={branch.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{branch.name}</CardTitle>
                    <div className="flex items-center mt-1 gap-2">
                      <span 
                        onClick={(e) => openTablesModal(branch, e)}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <Table className="h-3 w-3 mr-1" />
                        {branch.tables?.length || 0} Tables
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        branch.isActive 
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" 
                          : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                      }`}>
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <CardDescription className="flex items-center mt-2">
                  <MapPin className="h-3 w-3 mr-1" /> {branch.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-2" />
                    <span>{branch.contactNumber}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => openEditModal(branch)}
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-red-500 hover:text-red-700"
                    onClick={() => openDeleteModal(branch)}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Branch</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Branch Name <span className="text-red-500">*</span></label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address <span className="text-red-500">*</span></label>
                <Input 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter branch address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number <span className="text-red-500">*</span></label>
                <Input 
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Tables</label>
                <Input 
                  name="numberOfTables"
                  type="number"
                  value={formData.numberOfTables}
                  onChange={handleInputChange}
                  placeholder="Enter number of tables"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isActive">Active</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setError(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddBranch}>
                Add Branch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Branch</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Branch Name <span className="text-red-500">*</span></label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address <span className="text-red-500">*</span></label>
                <Input 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter branch address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number <span className="text-red-500">*</span></label>
                <Input 
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Tables</label>
                <Input 
                  name="numberOfTables"
                  type="number"
                  value={formData.numberOfTables}
                  onChange={handleInputChange}
                  placeholder="Enter number of tables"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="editIsActive">Active</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setError(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditBranch}>
                Update Branch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tables Modal */}
      {isTablesModalOpen && currentBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Tables at {currentBranch.name}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsTablesModalOpen(false);
                  setSelectedTables([]);
                }}
              >
                Close
              </Button>
            </div>
            
            {selectedTables.length === 0 ? (
              <div className="text-center py-8">
                <Table className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No tables available for this branch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {selectedTables.map((table) => (
                  <div 
                    key={table.id || table._id} 
                    className={`p-4 rounded-lg flex flex-col items-center justify-center aspect-square shadow-sm border ${
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
        </div>
      )}

    </div>
  );
}

export default Branches;
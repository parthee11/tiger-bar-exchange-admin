import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import tablesApi from '../api/tables';
import branchesApi from '../api/branches';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '../components/ui/card';

// Import custom components
import TableList from '../components/tables/table-list';
import SelectDropdown from '../components/tables/select-dropdown';
import { AddTableDialog, EditTableDialog, DeleteTableDialog } from '../components/tables/table-dialogs';

// Loading Component
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

// Table Management Component
const TableManagement = () => {
  useAuth();
  const { toast } = useToast();
  const [error, setError] = useState(null);

  // State
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Form state
  const [tableNumber, setTableNumber] = useState('');
  const [tableStatus, setTableStatus] = useState('available');

  // Fetch tables for the selected branch
  const fetchTables = useCallback(async () => {
    if (!selectedBranch) return;

    setLoading(true);
    try {
      const response = await tablesApi.getBranchTables(selectedBranch);
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load tables. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tables. Please try again.",
      });
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, toast]);

  // Load branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchesApi.getBranches();
        if (response.success && response.data) {
          setBranches(response.data);

          // Select the first branch by default if available
          if (response.data.length > 0) {
            setSelectedBranch(response.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('Failed to load branches. Please try again.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load branches. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [toast]);

  // Load tables when a branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchTables();
    }
  }, [selectedBranch, fetchTables]);

  // Set document title
  useEffect(() => {
    document.title = 'Table Management | Tiger Bar Exchange';
    return () => {
      document.title = 'Tiger Bar Exchange Admin';
    };
  }, []);

  // Handle branch change
  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTables = tables.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tables.length / itemsPerPage);

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setTableNumber('');
    setTableStatus('available');
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenEditDialog = (table) => {
    setSelectedTable(table);
    setTableNumber(table.tableNumber);
    setTableStatus(table.status);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedTable(null);
    setTableNumber('');
  };

  const handleOpenDeleteDialog = (table) => {
    setSelectedTable(table);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTable(null);
  };

  // Form handlers
  const handleAddTable = async () => {
    setError(null);
    if (!tableNumber) {
      setError('Table number is required');
      return;
    }

    try {
      const tableData = {
        tableNumber,
        status: tableStatus,
      };

      const response = await tablesApi.addTable(selectedBranch, tableData);

      if (response.success) {
        fetchTables();
        handleCloseAddDialog();
        toast({
          variant: "success",
          title: "Success",
          description: "Table added successfully",
        });
      } else {
        setError(response.message || 'Failed to add table');
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to add table",
        });
      }
    } catch (error) {
      console.error('Error adding table:', error);
      setError(error.message || 'Failed to add table');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add table",
      });
    }
  };

  const handleUpdateTable = async (tableId, newStatus) => {
    // Check if tableId is actually a string ID and not a React event object
    const actualTableId = typeof tableId === 'string' ? tableId : null;
    const idToUse = actualTableId || (selectedTable ? selectedTable._id : null);
    
    if (!idToUse) return;
    setError(null);

    try {
      const tableData = {
        status: (typeof newStatus === 'string' ? newStatus : null) || tableStatus,
      };

      // Only add tableNumber if it's provided and we're in the edit dialog (no explicit tableId passed)
      if (!actualTableId && tableNumber) {
        tableData.tableNumber = tableNumber;
      }

      const response = await tablesApi.updateTable(
        selectedBranch,
        idToUse,
        tableData
      );

      if (response.success) {
        fetchTables();
        if (!tableId) handleCloseEditDialog();
        toast({
          variant: "success",
          title: "Success",
          description: "Table updated successfully",
        });
      } else {
        setError(response.message || 'Failed to update table');
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update table",
        });
      }
    } catch (error) {
      console.error('Error updating table:', error);
      setError(error.message || 'Failed to update table');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update table",
      });
    }
  };

  const handleClearTable = async (table) => {
    // Just a shortcut to set status to available
    await handleUpdateTable(table._id, 'available');
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) {
      setError('No table selected for deletion');
      return;
    }
    
    if (!selectedBranch) {
      setError('No branch selected');
      return;
    }
    
    setError(null);

    try {
      // Validate that we have the required IDs
      if (!selectedTable._id) {
        setError('Invalid table ID');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid table ID",
        });
        return;
      }

      // Call the API with proper error handling
      const response = await tablesApi.deleteTable(
        selectedBranch,
        selectedTable._id,
      );

      if (response.success) {
        // Success case
        fetchTables();
        handleCloseDeleteDialog();
        toast({
          variant: "success",
          title: "Success",
          description: "Table deleted successfully",
        });
      } else {
        // API returned an error
        setError(response.message || 'Failed to delete table');
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete table",
        });
      }
    } catch (error) {
      // Exception was thrown
      console.error('Error deleting table:', error);
      const errorMessage = error.message || 'Failed to delete table';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Render main content or loading indicator
  if (loading && branches.length === 0) {
    return <LoadingIndicator />;
  }

  // Create branch options for select dropdown
  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: branch.name
  }));

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Table Management</h1>

          <Button
            onClick={handleOpenAddDialog}
            disabled={!selectedBranch}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Table
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Branch Selection</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={fetchTables}
              disabled={!selectedBranch}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Tables
            </Button>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2">
              <SelectDropdown
                id="branch-select"
                label="Select Branch"
                value={selectedBranch}
                onChange={handleBranchChange}
                options={branchOptions}
                placeholder="Select a branch"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
            {selectedBranch && (
              <CardDescription>
                Manage tables for the selected branch
              </CardDescription>
            )}
          </CardHeader>

          <TableList
            tables={tables}
            loading={loading}
            selectedBranch={selectedBranch}
            currentTables={currentTables}
            handleOpenEditDialog={handleOpenEditDialog}
            handleOpenDeleteDialog={handleOpenDeleteDialog}
            handleOpenAddDialog={handleOpenAddDialog}
            handleClearTable={handleClearTable}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            totalPages={totalPages}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </Card>
      </div>

      {/* Dialogs */}
      <AddTableDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onAdd={handleAddTable}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        tableStatus={tableStatus}
        setTableStatus={setTableStatus}
        error={error}
      />

      <EditTableDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onUpdate={handleUpdateTable}
        selectedTable={selectedTable}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        tableStatus={tableStatus}
        setTableStatus={setTableStatus}
        error={error}
      />

      <DeleteTableDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDeleteTable}
        selectedTable={selectedTable}
        error={error}
      />
    </>
  );
};

export default TableManagement;
import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Package, Upload, FileUp, X, Check, AlertCircle } from "lucide-react";
import api from "../api/api";
import { useConfirmationDialog } from "../components/providers/confirmation-provider";
import { useToast } from "../components/ui/use-toast";
import { ItemTable } from "../components/items/ItemTable";
import { ItemModal } from "../components/items/ItemModal";
import { ItemTypeTag } from "../components/items/ItemTypeTag";

export function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branchesState, setBranchesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "food",
    category: "",
    branches: [],
    isHardLiquor: false,
    floorPrice: ""
  });
  const [bulkImportData, setBulkImportData] = useState([]);
  const [bulkImportStep, setBulkImportStep] = useState(1); // 1: Upload, 2: Review, 3: Success
  const [bulkImportError, setBulkImportError] = useState(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { openConfirmation } = useConfirmationDialog();
  const { toast } = useToast();

  // Fetch all items, categories, and branches on component mount
  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchBranches();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.items.getItems();
      setItems(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await api.branches.getBranches();
      setBranchesState(data.data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const handleAddItem = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.category || formData.branches.length === 0 || !formData.floorPrice) {
        setError("Name, type, category, at least one branch, and floor price are required.");
        return;
      }
      
      const newItemData = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        branches: formData.branches,
        isHardLiquor: formData.isHardLiquor,
        floorPrice: parseFloat(formData.floorPrice)
      };
      
      await api.items.createItem(newItemData);
      setIsAddModalOpen(false);
      resetForm();
      fetchItems();
      setError(null);
      
      toast({
        title: "Item Added",
        description: `${newItemData.name} has been added successfully.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.category || formData.branches.length === 0 || !formData.floorPrice) {
        setError("Name, type, category, at least one branch, and floor price are required.");
        return;
      }
      
      const updatedItemData = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        branches: formData.branches,
        isHardLiquor: formData.isHardLiquor,
        floorPrice: parseFloat(formData.floorPrice)
      };
      
      await api.items.updateItem(currentItem._id, updatedItemData);
      setIsEditModalOpen(false);
      resetForm();
      fetchItems();
      setError(null);
      
      toast({
        title: "Item Updated",
        description: `${updatedItemData.name} has been updated successfully.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = (item) => {
    openConfirmation({
      title: "Delete Item",
      message: `Are you sure you want to delete ${item.name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          await api.items.deleteItem(item._id);
          fetchItems();
          setError(null);
          
          toast({
            title: "Item Deleted",
            description: `${item.name} has been deleted successfully.`,
            variant: "success",
          });
        } catch (err) {
          console.error("Error deleting item:", err);
          setError("Failed to delete item. Please try again.");
          
          toast({
            title: "Error",
            description: "Failed to delete item. Please try again.",
            variant: "destructive",
          });
        }
      }
    });
  };

  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setError(null);
    setFormData({
      name: item.name,
      type: item.type,
      category: item.category._id || item.category,
      branches: item.branches.map(branch => typeof branch === 'object' ? branch._id : branch),
      isHardLiquor: item.isHardLiquor || false,
      floorPrice: item.floorPrice.toString()
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "food",
      category: "",
      branches: [],
      isHardLiquor: false,
      floorPrice: ""
    });
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeChange = (value) => {
    setFormData({
      ...formData,
      type: value
    });
  };

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value
    });
  };

  const handleBranchChange = (branchId) => {
    const updatedBranches = formData.branches.includes(branchId)
      ? formData.branches.filter(id => id !== branchId)
      : [...formData.branches, branchId];
    
    setFormData({
      ...formData,
      branches: updatedBranches
    });
  };

  const handleCheckboxChange = (checked) => {
    setFormData({
      ...formData,
      isHardLiquor: checked
    });
  };
  
  // Bulk import functions
  const openBulkImportModal = () => {
    setBulkImportStep(1);
    setBulkImportData([]);
    setBulkImportError(null);
    setBulkImportSuccess(null);
    setIsBulkImportModalOpen(true);
  };
  
  const closeBulkImportModal = () => {
    setIsBulkImportModalOpen(false);
    setBulkImportStep(1);
    setBulkImportData([]);
    setBulkImportError(null);
    setBulkImportSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type (accept .csv, .json)
    const fileType = file.name.split('.').pop().toLowerCase();
    if (fileType !== 'csv' && fileType !== 'json') {
      setBulkImportError("Please upload a CSV or JSON file");
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        let parsedData = [];
        
        if (fileType === 'csv') {
          // Parse CSV
          const csvText = event.target.result;
          const lines = csvText.split('\n');
          
          // Check if there's a header row
          const headerRow = lines[0].split(',');
          const hasHeader = headerRow.some(header => 
            header.trim().toLowerCase() === 'name' || 
            header.trim().toLowerCase() === 'type' || 
            header.trim().toLowerCase() === 'category'
          );
          
          // Find column indices
          let nameIndex = 0;
          let typeIndex = 1;
          let categoryIndex = 2;
          let branchesIndex = 3;
          let floorPriceIndex = 4;
          let isHardLiquorIndex = 5;
          
          if (hasHeader) {
            headerRow.forEach((header, index) => {
              const headerText = header.trim().toLowerCase();
              if (headerText === 'name') nameIndex = index;
              if (headerText === 'type') typeIndex = index;
              if (headerText === 'category') categoryIndex = index;
              if (headerText === 'branches') branchesIndex = index;
              if (headerText === 'floorprice') floorPriceIndex = index;
              if (headerText === 'ishardliquor') isHardLiquorIndex = index;
            });
            
            // Skip header row in processing
            lines.shift();
          }
          
          // Process data rows
          lines.forEach(line => {
            if (!line.trim()) return; // Skip empty lines
            
            const values = line.split(',');
            if (values.length < 5) return; // Need at least name, type, category, branches, floorPrice
            
            const name = values[nameIndex]?.trim();
            const type = values[typeIndex]?.trim().toLowerCase();
            const category = values[categoryIndex]?.trim();
            
            // Parse branches (comma-separated list in quotes or array notation)
            let branches = [];
            if (values[branchesIndex]) {
              const branchesStr = values[branchesIndex].trim();
              // Try to parse as JSON array if it starts with [ and ends with ]
              if (branchesStr.startsWith('[') && branchesStr.endsWith(']')) {
                try {
                  branches = JSON.parse(branchesStr);
                } catch (e) {
                  // If parsing fails, split by semicolon
                  branches = branchesStr.replace(/[\[\]"']/g, '').split(';').map(b => b.trim()).filter(Boolean);
                }
              } else {
                // Split by semicolon
                branches = branchesStr.split(';').map(b => b.trim()).filter(Boolean);
              }
            }
            
            const floorPriceStr = values[floorPriceIndex]?.trim();
            const floorPrice = parseFloat(floorPriceStr);
            
            // Parse isHardLiquor (default to false if not specified or invalid)
            let isHardLiquor = false;
            if (values[isHardLiquorIndex]) {
              const isHardLiquorStr = values[isHardLiquorIndex].trim().toLowerCase();
              if (isHardLiquorStr === 'true' || isHardLiquorStr === 'yes' || isHardLiquorStr === '1') {
                isHardLiquor = true;
              }
            }
            
            // Validate required fields and types
            if (
              name && 
              ['food', 'drinks', 'sheesha'].includes(type) && 
              category && 
              branches.length > 0 && 
              !isNaN(floorPrice) && 
              floorPrice >= 0
            ) {
              // Find category ID by name if it's not already an ID
              let categoryId = category;
              if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
                const foundCategory = categories.find(cat => 
                  cat.name.toLowerCase() === category.toLowerCase()
                );
                if (foundCategory) {
                  categoryId = foundCategory._id;
                } else {
                  // Skip this item if category not found
                  return;
                }
              }
              
                parsedData.push({
                  name,
                  type,
                  category: categoryId,
                  branches,
                  floorPrice,
                  isHardLiquor: type === 'drinks' ? isHardLiquor : false
                });
            }
          });
        } else if (fileType === 'json') {
          // Parse JSON
          const jsonData = JSON.parse(event.target.result);
          
          const processItem = (item) => {
            // Validate required fields
            if (
              !item.name || 
              !item.type || 
              !item.category || 
              !item.branches || 
              !Array.isArray(item.branches) || 
              item.branches.length === 0 || 
              item.floorPrice === undefined
            ) {
              return null;
            }
            
            // Validate types
            const type = item.type.toLowerCase();
            if (!['food', 'drinks', 'sheesha'].includes(type)) {
              return null;
            }
            
            const floorPrice = parseFloat(item.floorPrice);
            if (isNaN(floorPrice) || floorPrice < 0) {
              return null;
            }
            
            // Find category ID by name if it's not already an ID
            let categoryId = item.category;
            if (typeof categoryId === 'string' && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
              const foundCategory = categories.find(cat => 
                cat.name.toLowerCase() === item.category.toLowerCase()
              );
              if (foundCategory) {
                categoryId = foundCategory._id;
              } else {
                return null;
              }
            }
            
            // Find branch IDs by name if they're not already IDs
            const branchIds = item.branches.map(branch => {
              if (typeof branch === 'string') {
                if (branch.match(/^[0-9a-fA-F]{24}$/)) {
                  return branch;
                } else {
                  const foundBranch = branchesState.find(b => 
                    b.name && b.name.toLowerCase() === branch.toLowerCase()
                  );
                  return foundBranch ? foundBranch._id : null;
                }
              } else if (typeof branch === 'object' && branch._id) {
                return branch._id;
              }
              return null;
            }).filter(Boolean);
            
            if (branchIds.length === 0) {
              return null;
            }
            
            return {
              name: item.name,
              type,
              category: categoryId,
              branches: branchIds,
              floorPrice,
              isHardLiquor: type === 'drinks' ? !!item.isHardLiquor : false
            };
          };
          
          if (Array.isArray(jsonData)) {
            // Array of items
            parsedData = jsonData.map(processItem).filter(Boolean);
          } else if (jsonData.items && Array.isArray(jsonData.items)) {
            // Object with items array
            parsedData = jsonData.items.map(processItem).filter(Boolean);
          }
        }
        
        if (parsedData.length === 0) {
          setBulkImportError("No valid item data found in the file. Please check the format.");
          return;
        }
        
        setBulkImportData(parsedData);
        setBulkImportStep(2); // Move to review step
        setBulkImportError(null);
      } catch (err) {
        console.error("Error parsing file:", err);
        setBulkImportError("Failed to parse file. Please check the format.");
      }
    };
    
    reader.onerror = () => {
      setBulkImportError("Error reading file. Please try again.");
    };
    
    reader.readAsText(file);
  };
  
  const handleBulkImport = async () => {
    if (bulkImportData.length === 0) {
      setBulkImportError("No data to import");
      return;
    }
    
    setIsImporting(true);
    setBulkImportError(null);
    
    try {
      const response = await api.items.bulkImportItems(bulkImportData);
      const importedCount = response.data?.imported || bulkImportData.length;
      setBulkImportSuccess(`Successfully imported ${importedCount} items`);
      setBulkImportStep(3); // Move to success step
      fetchItems(); // Refresh the items list
      
      toast({
        title: "Bulk Import Successful",
        description: `Successfully imported ${importedCount} items.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error importing items:", err);
      setBulkImportError("Failed to import items. Please try again.");
      
      toast({
        title: "Bulk Import Failed",
        description: "Failed to import items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Get item type badge color
  const getItemTypeColor = (type) => {
    switch (type) {
      case 'sheesha':
        return 'bg-purple-100 text-purple-800';
      case 'food':
        return 'bg-green-100 text-green-800';
      case 'drinks':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter items based on search term
  const displayItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && typeof item.category === 'object' && item.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Format price with currency (AED - Dirhams)
  const formatPrice = (price) => {
    return price ? `${parseFloat(price).toFixed(2)} AED` : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">
            Manage your menu items
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={openBulkImportModal}
          >
            <Upload className="h-4 w-4" /> Bulk Import
          </Button>
          <Button className="flex items-center gap-1" onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} found
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <p>Loading items...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-gray-400">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium">No items found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Get started by adding your first item.
          </p>
          <Button className="mt-4" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Item
          </Button>
        </div>
      ) : (
        <ItemTable 
          items={displayItems}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          getCategoryName={getCategoryName}
          formatPrice={formatPrice}
        />
      )}

      {/* Add Item Modal */}
      <ItemModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setError(null);
        }}
        onSubmit={handleAddItem}
        title="Add New Item"
        submitText="Add Item"
        formData={formData}
        handleInputChange={handleInputChange}
        handleTypeChange={handleTypeChange}
        handleCategoryChange={handleCategoryChange}
        handleBranchChange={handleBranchChange}
        handleCheckboxChange={handleCheckboxChange}
        categories={categories}
        branches={branchesState}
        error={error}
      />

      {/* Edit Item Modal */}
      <ItemModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setError(null);
        }}
        onSubmit={handleEditItem}
        title="Edit Item"
        submitText="Update Item"
        formData={formData}
        handleInputChange={handleInputChange}
        handleTypeChange={handleTypeChange}
        handleCategoryChange={handleCategoryChange}
        handleBranchChange={handleBranchChange}
        handleCheckboxChange={handleCheckboxChange}
        categories={categories}
        branches={branchesState}
        error={error}
      />

      {/* Bulk Import Modal */}
      {isBulkImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Bulk Import Items</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={closeBulkImportModal}
                type="button"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Step 1: Upload File */}
            {bulkImportStep === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        Upload a CSV or JSON file with item data. The file should contain columns for name, type, category, branches, floorPrice, and isHardLiquor (optional).
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Required fields:</strong> name, type, category, branches, floorPrice
                      </p>
                    </div>
                  </div>
                </div>
                
                {bulkImportError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{bulkImportError}</span>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileUp className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    Supported formats: .csv, .json
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Sample CSV Format:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    name,type,category,branches,floorPrice,isHardLiquor<br/>
                    Burger,food,Burgers,branch1;branch2,10.99,false<br/>
                    Mojito,drinks,Cocktails,branch1;branch3,8.50,true<br/>
                    Apple Flavor,sheesha,Fruit Flavors,branch2;branch3,20.00,false
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Sample JSON Format:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {`[
  {
    "name": "Burger",
    "type": "food",
    "category": "Burgers",
    "branches": ["branch1", "branch2"],
    "floorPrice": 10.99
  },
  {
    "name": "Mojito",
    "type": "drinks",
    "category": "Cocktails",
    "branches": ["branch1", "branch3"],
    "floorPrice": 8.50,
    "isHardLiquor": true
  }
]`}
                  </pre>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mt-4">
                  <p className="text-sm">
                    <strong>Note:</strong> For categories and branches, you can use either IDs or names. If using names, they must match exactly with existing categories and branches in the system.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 2: Review Data */}
            {bulkImportStep === 2 && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        Review the items below before importing. {bulkImportData.length} items found.
                      </p>
                    </div>
                  </div>
                </div>
                
                {bulkImportError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{bulkImportError}</span>
                  </div>
                )}
                
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Category</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Floor Price</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Hard Liquor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkImportData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              getItemTypeColor(item.type)
                            }`}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {typeof item.category === 'object' 
                              ? item.category.name 
                              : getCategoryName(item.category)}
                          </td>
                          <td className="px-4 py-2">{formatPrice(item.floorPrice)}</td>
                          <td className="px-4 py-2">{item.isHardLiquor ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setBulkImportStep(1);
                      setBulkImportError(null);
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleBulkImport}
                    disabled={isImporting}
                  >
                    {isImporting ? "Importing..." : "Import Items"}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Success */}
            {bulkImportStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">Import Successful</h3>
                <p className="text-gray-500">{bulkImportSuccess}</p>
                <Button 
                  className="mt-4" 
                  onClick={closeBulkImportModal}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
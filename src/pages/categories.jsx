import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select-advanced";
import { Textarea } from "../components/ui/textarea";
import { Plus, Edit, Trash2, Tag, Upload, FileUp, X, Check, AlertCircle } from "lucide-react";
import api from "../api/api";
import { useConfirmationDialog } from "../components/providers/confirmation-provider";

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "food",
    description: ""
  });
  const [bulkImportData, setBulkImportData] = useState([]);
  const [bulkImportStep, setBulkImportStep] = useState(1); // 1: Upload, 2: Review, 3: Success
  const [bulkImportError, setBulkImportError] = useState(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { openConfirmation } = useConfirmationDialog();

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.categories.getCategories();
      setCategories(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type) {
        setError("Category name and type are required.");
        return;
      }
      
      const newCategoryData = {
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      
      await api.categories.createCategory(newCategoryData);
      setIsAddModalOpen(false);
      resetForm();
      fetchCategories();
      setError(null);
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category. Please try again.");
    }
  };

  const handleEditCategory = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type) {
        setError("Category name and type are required.");
        return;
      }
      
      const updatedCategoryData = {
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      
      await api.categories.updateCategory(currentCategory._id, updatedCategoryData);
      setIsEditModalOpen(false);
      resetForm();
      fetchCategories();
      setError(null);
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again.");
    }
  };

  const openDeleteModal = (category) => {
    openConfirmation({
      title: "Delete Category",
      message: `Are you sure you want to delete ${category.name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          await api.categories.deleteCategory(category._id);
          fetchCategories();
          setError(null);
        } catch (err) {
          console.error("Error deleting category:", err);
          setError("Failed to delete category. Please try again.");
        }
      }
    });
  };

  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setError(null);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || ""
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "food",
      description: ""
    });
    setCurrentCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      type: value
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
            header.trim().toLowerCase() === 'description'
          );
          
          // Find column indices
          let nameIndex = 0;
          let typeIndex = 1;
          let descIndex = 2;
          
          if (hasHeader) {
            headerRow.forEach((header, index) => {
              const headerText = header.trim().toLowerCase();
              if (headerText === 'name') nameIndex = index;
              if (headerText === 'type') typeIndex = index;
              if (headerText === 'description') descIndex = index;
            });
            
            // Skip header row in processing
            lines.shift();
          }
          
          // Process data rows
          lines.forEach(line => {
            if (!line.trim()) return; // Skip empty lines
            
            const values = line.split(',');
            if (values.length < 2) return; // Need at least name and type
            
            const name = values[nameIndex]?.trim();
            const type = values[typeIndex]?.trim().toLowerCase();
            const description = values[descIndex]?.trim() || '';
            
            if (name && (type === 'food' || type === 'drinks' || type === 'sheesha')) {
              parsedData.push({ name, type, description });
            }
          });
        } else if (fileType === 'json') {
          // Parse JSON
          const jsonData = JSON.parse(event.target.result);
          
          if (Array.isArray(jsonData)) {
            // Array of categories
            parsedData = jsonData.filter(item => {
              return (
                item.name && 
                typeof item.name === 'string' && 
                item.type && 
                typeof item.type === 'string' &&
                ['food', 'drinks', 'sheesha'].includes(item.type.toLowerCase())
              );
            }).map(item => ({
              name: item.name.trim(),
              type: item.type.toLowerCase(),
              description: item.description || ''
            }));
          } else if (jsonData.categories && Array.isArray(jsonData.categories)) {
            // Object with categories array
            parsedData = jsonData.categories.filter(item => {
              return (
                item.name && 
                typeof item.name === 'string' && 
                item.type && 
                typeof item.type === 'string' &&
                ['food', 'drinks', 'sheesha'].includes(item.type.toLowerCase())
              );
            }).map(item => ({
              name: item.name.trim(),
              type: item.type.toLowerCase(),
              description: item.description || ''
            }));
          }
        }
        
        if (parsedData.length === 0) {
          setBulkImportError("No valid category data found in the file. Please check the format.");
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
    
    if (fileType === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };
  
  const handleBulkImport = async () => {
    if (bulkImportData.length === 0) {
      setBulkImportError("No data to import");
      return;
    }
    
    setIsImporting(true);
    setBulkImportError(null);
    
    try {
      const response = await api.categories.bulkImportCategories(bulkImportData);
      setBulkImportSuccess(`Successfully imported ${response.data?.imported || bulkImportData.length} categories`);
      setBulkImportStep(3); // Move to success step
      fetchCategories(); // Refresh the categories list
    } catch (err) {
      console.error("Error importing categories:", err);
      setBulkImportError("Failed to import categories. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Get category type badge color
  const getCategoryTypeColor = (type) => {
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

  // Filter categories based on search term
  const displayCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories
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
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {displayCategories.length} {displayCategories.length === 1 ? 'category' : 'categories'} found
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <p>Loading categories...</p>
        </div>
      ) : displayCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-gray-400">
            <Tag className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium">No categories found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Get started by adding your first category.
          </p>
          <Button className="mt-4" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Category
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {displayCategories.map((category) => (
                  <tr 
                    key={category._id} 
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">{category.name}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        getCategoryTypeColor(category.type)
                      }`}>
                        {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      {category.description || "-"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-red-500 hover:text-red-700"
                          onClick={() => openDeleteModal(category)}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name <span className="text-red-500">*</span></label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
                <Select 
                  value={formData.type} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="sheesha">Sheesha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setError(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>
                Add Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name <span className="text-red-500">*</span></label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
                <Select 
                  value={formData.type} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="sheesha">Sheesha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setError(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditCategory}>
                Update Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Bulk Import Categories</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={closeBulkImportModal}
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
                        Upload a CSV or JSON file with category data. The file should contain columns for name, type, and description.
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Supported types:</strong> food, drinks, sheesha
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
                    name,type,description<br/>
                    Burgers,food,All burger items<br/>
                    Cocktails,drinks,Signature cocktails<br/>
                    Fruit Flavors,sheesha,Fruit-based sheesha flavors
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Sample JSON Format:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {`[
  {"name": "Burgers", "type": "food", "description": "All burger items"},
  {"name": "Cocktails", "type": "drinks", "description": "Signature cocktails"},
  {"name": "Fruit Flavors", "type": "sheesha", "description": "Fruit-based sheesha flavors"}
]`}
                  </pre>
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
                        Review the categories below before importing. {bulkImportData.length} categories found.
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
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkImportData.map((category, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{category.name}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              getCategoryTypeColor(category.type)
                            }`}>
                              {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2">{category.description || "-"}</td>
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
                    {isImporting ? "Importing..." : "Import Categories"}
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

export default Categories;
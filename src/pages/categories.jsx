import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Tag, Upload } from "lucide-react";
import api from "../api/api";
import { useConfirmationDialog } from "../components/providers/confirmation-provider";
import { useToast } from "../components/ui/use-toast";
import { CategoryTable } from "../components/categories/CategoryTable";
import { CategoryAddModal } from "../components/categories/CategoryAddModal";
import { CategoryEditModal } from "../components/categories/CategoryEditModal";
import { BulkImportModal } from "../components/categories/BulkImportModal";
import { EmptyState } from "../components/ui/EmptyState";

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
  
  const { openConfirmation } = useConfirmationDialog();
  const { toast } = useToast();

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories. Please try again."
      });
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
      
      toast({
        title: "Category Added",
        description: `${newCategoryData.name} has been added successfully.`,
        variant: "default"
      });
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add category. Please try again."
      });
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
      
      toast({
        title: "Category Updated",
        description: `${updatedCategoryData.name} has been updated successfully.`,
        variant: "default"
      });
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update category. Please try again."
      });
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
          
          toast({
            title: "Category Deleted",
            description: `${category.name} has been deleted successfully.`,
            variant: "default"
          });
        } catch (err) {
          console.error("Error deleting category:", err);
          setError("Failed to delete category. Please try again.");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete category. Please try again."
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
      const response = await api.categories.bulkImportCategories(bulkImportData);
      const importedCount = response.data?.imported || bulkImportData.length;
      setBulkImportSuccess(`Successfully imported ${importedCount} categories`);
      setBulkImportStep(3); // Move to success step
      fetchCategories(); // Refresh the categories list
      
      toast({
        title: "Bulk Import Successful",
        description: `Successfully imported ${importedCount} categories.`,
        variant: "default"
      });
    } catch (err) {
      console.error("Error importing categories:", err);
      setBulkImportError("Failed to import categories. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import categories. Please try again."
      });
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
  
  // Navigate between bulk import steps
  const goToStep = (step) => {
    setBulkImportStep(step);
    setBulkImportError(null);
  };

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
        <EmptyState 
          icon={<Tag className="h-12 w-12 mx-auto" />}
          title="No categories found"
          description="Get started by adding your first category."
          buttonText={<><Plus className="h-4 w-4 mr-2" /> Add Your First Category</>}
          onAction={openAddModal}
        />
      ) : (
        <CategoryTable 
          categories={displayCategories}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          getCategoryTypeColor={getCategoryTypeColor}
        />
      )}

      {/* Add Category Modal */}
      <CategoryAddModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setError(null);
        }}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleAddCategory={handleAddCategory}
        error={error}
      />

      {/* Edit Category Modal */}
      <CategoryEditModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setError(null);
        }}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleEditCategory={handleEditCategory}
        error={error}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal 
        isOpen={isBulkImportModalOpen}
        onClose={closeBulkImportModal}
        bulkImportData={bulkImportData}
        bulkImportStep={bulkImportStep}
        bulkImportError={bulkImportError}
        bulkImportSuccess={bulkImportSuccess}
        isImporting={isImporting}
        handleFileUpload={handleFileUpload}
        handleBulkImport={handleBulkImport}
        getCategoryTypeColor={getCategoryTypeColor}
        goToStep={goToStep}
      />
    </div>
  );
}

export default Categories;
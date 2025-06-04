import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Plus, Edit, Trash2, Package, Upload, FileUp, X, Check, AlertCircle, Wine } from "lucide-react";
import api from "../api/api";
import { useConfirmationDialog } from "../components/providers/confirmation-provider";

export function Mixers() {
  const [mixers, setMixers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [currentMixer, setCurrentMixer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    available: true
  });
  const [bulkImportData, setBulkImportData] = useState([]);
  const [bulkImportStep, setBulkImportStep] = useState(1); // 1: Upload, 2: Review, 3: Success
  const [bulkImportError, setBulkImportError] = useState(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { openConfirmation } = useConfirmationDialog();

  // Fetch all mixers on component mount
  useEffect(() => {
    fetchMixers();
  }, []);

  const fetchMixers = async () => {
    setLoading(true);
    try {
      const data = await api.mixers.getMixers();
      setMixers(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching mixers:", err);
      setError("Failed to load mixers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMixer = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.price) {
        setError("Name and price are required.");
        return;
      }
      
      const newMixerData = {
        name: formData.name,
        price: parseFloat(formData.price),
        available: formData.available
      };
      
      await api.mixers.createMixer(newMixerData);
      setIsAddModalOpen(false);
      resetForm();
      fetchMixers();
      setError(null);
    } catch (err) {
      console.error("Error adding mixer:", err);
      setError("Failed to add mixer. Please try again.");
    }
  };

  const handleEditMixer = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.price) {
        setError("Name and price are required.");
        return;
      }
      
      const updatedMixerData = {
        name: formData.name,
        price: parseFloat(formData.price),
        available: formData.available
      };
      
      await api.mixers.updateMixer(currentMixer._id, updatedMixerData);
      setIsEditModalOpen(false);
      resetForm();
      fetchMixers();
      setError(null);
    } catch (err) {
      console.error("Error updating mixer:", err);
      setError("Failed to update mixer. Please try again.");
    }
  };

  const openDeleteModal = (mixer) => {
    openConfirmation({
      title: "Delete Mixer",
      message: `Are you sure you want to delete ${mixer.name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          await api.mixers.deleteMixer(mixer._id);
          fetchMixers();
          setError(null);
        } catch (err) {
          console.error("Error deleting mixer:", err);
          setError("Failed to delete mixer. Please try again.");
        }
      }
    });
  };

  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (mixer) => {
    setCurrentMixer(mixer);
    setError(null);
    setFormData({
      name: mixer.name,
      price: mixer.price.toString(),
      available: mixer.available
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      available: true
    });
    setCurrentMixer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (checked) => {
    setFormData({
      ...formData,
      available: checked
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
            header.trim().toLowerCase() === 'price' || 
            header.trim().toLowerCase() === 'available'
          );
          
          // Find column indices
          let nameIndex = 0;
          let priceIndex = 1;
          let availableIndex = 2;
          
          if (hasHeader) {
            headerRow.forEach((header, index) => {
              const headerText = header.trim().toLowerCase();
              if (headerText === 'name') nameIndex = index;
              if (headerText === 'price') priceIndex = index;
              if (headerText === 'available') availableIndex = index;
            });
            
            // Skip header row in processing
            lines.shift();
          }
          
          // Process data rows
          lines.forEach(line => {
            if (!line.trim()) return; // Skip empty lines
            
            const values = line.split(',');
            if (values.length < 2) return; // Need at least name and price
            
            const name = values[nameIndex]?.trim();
            const priceStr = values[priceIndex]?.trim();
            const price = parseFloat(priceStr);
            
            // Parse available value (default to true if not specified or invalid)
            let available = true;
            if (values[availableIndex]) {
              const availableStr = values[availableIndex].trim().toLowerCase();
              if (availableStr === 'false' || availableStr === 'no' || availableStr === '0') {
                available = false;
              }
            }
            
            if (name && !isNaN(price) && price >= 0) {
              parsedData.push({ name, price, available });
            }
          });
        } else if (fileType === 'json') {
          // Parse JSON
          const jsonData = JSON.parse(event.target.result);
          
          if (Array.isArray(jsonData)) {
            // Array of mixers
            parsedData = jsonData.filter(item => {
              const price = parseFloat(item.price);
              return (
                item.name && 
                typeof item.name === 'string' && 
                !isNaN(price) && 
                price >= 0
              );
            }).map(item => ({
              name: item.name.trim(),
              price: parseFloat(item.price),
              available: item.available !== false // Default to true if not specified
            }));
          } else if (jsonData.mixers && Array.isArray(jsonData.mixers)) {
            // Object with mixers array
            parsedData = jsonData.mixers.filter(item => {
              const price = parseFloat(item.price);
              return (
                item.name && 
                typeof item.name === 'string' && 
                !isNaN(price) && 
                price >= 0
              );
            }).map(item => ({
              name: item.name.trim(),
              price: parseFloat(item.price),
              available: item.available !== false // Default to true if not specified
            }));
          }
        }
        
        if (parsedData.length === 0) {
          setBulkImportError("No valid mixer data found in the file. Please check the format.");
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
      const response = await api.mixers.bulkImportMixers(bulkImportData);
      setBulkImportSuccess(`Successfully imported ${response.data?.imported || bulkImportData.length} mixers`);
      setBulkImportStep(3); // Move to success step
      fetchMixers(); // Refresh the mixers list
    } catch (err) {
      console.error("Error importing mixers:", err);
      setBulkImportError("Failed to import mixers. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter mixers based on search term
  const displayMixers = mixers.filter(mixer => 
    mixer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format price with currency
  const formatPrice = (price) => {
    return price ? `$${parseFloat(price).toFixed(2)}` : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mixers</h1>
          <p className="text-muted-foreground">
            Manage your mixers for drinks
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
            <Plus className="h-4 w-4" /> Add Mixer
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search mixers..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {displayMixers.length} {displayMixers.length === 1 ? 'mixer' : 'mixers'} found
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <p>Loading mixers...</p>
        </div>
      ) : displayMixers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-gray-400">
            <Wine className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium">No mixers found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Get started by adding your first mixer.
          </p>
          <Button className="mt-4" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Mixer
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Available</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {displayMixers.map((mixer) => (
                  <tr 
                    key={mixer._id} 
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">{mixer.name}</td>
                    <td className="p-4 align-middle">{formatPrice(mixer.price)}</td>
                    <td className="p-4 align-middle">
                      {mixer.available ? "Yes" : "No"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => openEditModal(mixer)}
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-red-500 hover:text-red-700"
                          onClick={() => openDeleteModal(mixer)}
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

      {/* Add Mixer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Mixer</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter mixer name"
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={formData.available}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMixer}>
                  Add Mixer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mixer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Mixer</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter mixer name"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-available"
                  checked={formData.available}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="edit-available">Available</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMixer}>
                  Update Mixer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Bulk Import Mixers</h2>
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
                        Upload a CSV or JSON file with mixer data. The file should contain columns for name, price, and available status.
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Required fields:</strong> name, price
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
                    name,price,available<br/>
                    Coca Cola,2.50,true<br/>
                    Orange Juice,3.00,true<br/>
                    Tonic Water,2.00,false
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Sample JSON Format:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {`[
  {"name": "Coca Cola", "price": 2.50, "available": true},
  {"name": "Orange Juice", "price": 3.00, "available": true},
  {"name": "Tonic Water", "price": 2.00, "available": false}
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
                        Review the mixers below before importing. {bulkImportData.length} mixers found.
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
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkImportData.map((mixer, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{mixer.name}</td>
                          <td className="px-4 py-2">{formatPrice(mixer.price)}</td>
                          <td className="px-4 py-2">{mixer.available ? "Yes" : "No"}</td>
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
                    {isImporting ? "Importing..." : "Import Mixers"}
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

export default Mixers;
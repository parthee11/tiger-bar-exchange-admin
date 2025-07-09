import { useRef, useState } from "react";
import { AlertCircle, Check, FileUp, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { downloadCSV } from "../../utils/exportUtils";

/**
 * BulkImportModal component for importing mixers in bulk
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Function} props.onImport - Function to call when import is confirmed
 * @param {Function} props.formatPrice - Function to format price values
 * @returns {React.ReactElement} BulkImportModal component
 */
export function BulkImportModal({ isOpen, onClose, onImport, formatPrice }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Success
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type (accept .csv, .json)
    const fileType = file.name.split('.').pop().toLowerCase();
    if (fileType !== 'csv' && fileType !== 'json') {
      setError("Please upload a CSV or JSON file");
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
          setError("No valid mixer data found in the file. Please check the format.");
          return;
        }
        
        setData(parsedData);
        setStep(2); // Move to review step
        setError(null);
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse file. Please check the format.");
      }
    };
    
    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };
    
    reader.readAsText(file);
  };
  
  const handleImport = async () => {
    if (data.length === 0) {
      setError("No data to import");
      return;
    }
    
    setIsImporting(true);
    setError(null);
    
    try {
      const result = await onImport(data);
      setSuccess(`Successfully imported ${result?.imported || data.length} mixers`);
      setStep(3); // Move to success step
    } catch (err) {
      console.error("Error importing mixers:", err);
      setError("Failed to import mixers. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClose = () => {
    setStep(1);
    setData([]);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };
  
  const renderContent = () => {
    switch (step) {
      case 1: // Upload
        return (
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
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
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
            
            <div className="mt-4 flex justify-between items-center">
              <h3 className="font-medium">Sample CSV Format:</h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  const templateData = [
                    { name: "Coca Cola", price: 2.50, available: true },
                    { name: "Orange Juice", price: 3.00, available: true },
                    { name: "Tonic Water", price: 2.00, available: false }
                  ];
                  
                  const headers = [
                    { title: "name", key: "name" },
                    { title: "price", key: "price" },
                    { title: "available", key: "available" }
                  ];
                  
                  downloadCSV(templateData, headers, "mixers_template.csv");
                }}
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              name,price,available<br/>
              Coca Cola,2.50,true<br/>
              Orange Juice,3.00,true<br/>
              Tonic Water,2.00,false
            </pre>
            
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
        );
        
      case 2: // Review
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    Review the mixers below before importing. {data.length} mixers found.
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  const headers = [
                    { title: "name", key: "name" },
                    { title: "price", key: "price" },
                    { title: "available", key: "available" }
                  ];
                  downloadCSV(data, headers, "mixers_data.csv");
                }}
              >
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
            </div>
            
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
                  {data.map((mixer, index) => (
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
                  setStep(1);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? "Importing..." : "Import Mixers"}
              </Button>
            </div>
          </div>
        );
        
      case 3: // Success
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">Import Successful</h3>
            <p className="text-gray-500">{success}</p>
            <Button 
              className="mt-4" 
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Bulk Import Mixers"
      size={step === 1 ? "2xl" : "lg"}
    >
      {renderContent()}
    </Modal>
  );
}
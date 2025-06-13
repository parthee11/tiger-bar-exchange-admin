import { useRef } from "react";
import { Button } from "../ui/button";
import { Modal } from "../ui/Modal";
import { AlertCircle, FileUp, Check } from "lucide-react";

/**
 * BulkImportModal component for importing multiple categories at once
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Array} props.bulkImportData - Array of categories to import
 * @param {number} props.bulkImportStep - Current step in the import process (1: Upload, 2: Review, 3: Success)
 * @param {string|null} props.bulkImportError - Error message to display
 * @param {string|null} props.bulkImportSuccess - Success message to display
 * @param {boolean} props.isImporting - Whether the import is in progress
 * @param {Function} props.handleFileUpload - Function to handle file upload
 * @param {Function} props.handleBulkImport - Function to handle bulk import
 * @param {Function} props.getCategoryTypeColor - Function to get color class based on category type
 * @param {Function} props.goToStep - Function to navigate between steps
 * @returns {JSX.Element} BulkImportModal component
 */
export function BulkImportModal({ 
  isOpen, 
  onClose, 
  bulkImportData, 
  bulkImportStep, 
  bulkImportError, 
  bulkImportSuccess, 
  isImporting,
  handleFileUpload,
  handleBulkImport,
  getCategoryTypeColor,
  goToStep
}) {
  const fileInputRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Categories" size="2xl">
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
              onClick={() => goToStep(1)}
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
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
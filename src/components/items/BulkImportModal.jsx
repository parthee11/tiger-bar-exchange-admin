import { useRef } from 'react';
import { AlertCircle, Check, FileUp, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { downloadCSV } from '../../utils/exportUtils';

/**
 * BulkImportModal component for importing multiple items at once
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Array} props.bulkImportData - Array of items to import
 * @param {number} props.bulkImportStep - Current step in the import process (1: Upload, 2: Review, 3: Success)
 * @param {string|null} props.bulkImportError - Error message to display
 * @param {string|null} props.bulkImportSuccess - Success message to display
 * @param {boolean} props.isImporting - Whether the import is in progress
 * @param {Function} props.handleFileUpload - Function to handle file upload
 * @param {Function} props.handleBulkImport - Function to handle bulk import
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
  goToStep,
}) {
  const fileInputRef = useRef(null);

  // Function to handle CSV export
  const handleExportTemplate = () => {
    const templateData = [
      { name: 'Burger', type: 'food', category: 'Burgers', branches: 'branch1;branch2', floorPrice: 50, isHardLiquor: false },
      { name: 'Mojito', type: 'drinks', category: 'Cocktails', branches: 'branch1;branch3', floorPrice: 35, isHardLiquor: false },
      { name: 'Whiskey', type: 'drinks', category: 'Spirits', branches: 'branch2;branch3', floorPrice: 45, isHardLiquor: true },
    ];

    const headers = [
      { title: 'name', key: 'name' },
      { title: 'type', key: 'type' },
      { title: 'category', key: 'category' },
      { title: 'branches', key: 'branches' },
      { title: 'floorPrice', key: 'floorPrice' },
      { title: 'isHardLiquor', key: 'isHardLiquor' },
    ];

    downloadCSV(templateData, headers, 'items_template.csv');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Items" size="2xl">
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
                  Upload a CSV or JSON file with item data. The file should contain columns for name, type, category, floorPrice, and isHardLiquor.
                </p>
                <p className="text-sm mt-2">
                  <strong>Supported types:</strong> food, drinks
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

          <div className="mt-4 flex justify-between items-center">
            <h3 className="font-medium">Sample CSV Format:</h3>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleExportTemplate}
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
            name,type,category,branches,floorPrice,isHardLiquor<br/>
            Burger,food,Burgers,branch1;branch2,50,false<br/>
            Mojito,drinks,Cocktails,branch1;branch3,35,false<br/>
            Whiskey,drinks,Spirits,branch2;branch3,45,true
          </pre>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Sample JSON Format:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`[
  {"name": "Burger", "type": "food", "category": "Burgers", "branches": ["branch1", "branch2"], "floorPrice": 50, "isHardLiquor": false},
  {"name": "Mojito", "type": "drinks", "category": "Cocktails", "branches": ["branch1", "branch3"], "floorPrice": 35, "isHardLiquor": false},
  {"name": "Whiskey", "type": "drinks", "category": "Spirits", "branches": ["branch2", "branch3"], "floorPrice": 45, "isHardLiquor": true}
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

          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                const headers = [
                  { title: 'name', key: 'name' },
                  { title: 'type', key: 'type' },
                  { title: 'category', key: 'category' },
                  { title: 'branches', key: 'branches' },
                  { title: 'floorPrice', key: 'floorPrice' },
                  { title: 'isHardLiquor', key: 'isHardLiquor' },
                ];
                downloadCSV(bulkImportData, headers, 'items_data.csv');
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
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Branches</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Floor Price</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Hard Liquor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bulkImportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.type}</td>
                    <td className="px-4 py-2">{item.category}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(item.branches)
                        ? item.branches.join(', ')
                        : typeof item.branches === 'string'
                          ? item.branches
                          : '-'}
                    </td>
                    <td className="px-4 py-2">{item.floorPrice} AED</td>
                    <td className="px-4 py-2">{item.isHardLiquor ? 'Yes' : 'No'}</td>
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
              {isImporting ? 'Importing...' : 'Import Items'}
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

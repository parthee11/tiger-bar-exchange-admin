import React from 'react';
import { Button } from '../ui/button';
import { RefreshCw, Edit, Trash2, Plus } from 'lucide-react';
import StatusBadge from './status-badge';
import SelectDropdown from './select-dropdown';

const TableList = ({ 
  tables, 
  loading, 
  selectedBranch,
  currentTables,
  handleOpenEditDialog,
  handleOpenDeleteDialog,
  handleOpenAddDialog,
  handleClearTable,
  indexOfFirstItem,
  indexOfLastItem,
  totalPages,
  currentPage,
  itemsPerPage,
  handlePageChange,
  handleItemsPerPageChange
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin inline-block">
          <RefreshCw className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-2 text-muted-foreground">Loading tables...</p>
      </div>
    );
  }
  
  if (tables.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          {selectedBranch
            ? 'No tables found for this branch. Add a table to get started.'
            : 'Please select a branch to view tables.'}
        </p>
        {selectedBranch && (
          <Button className="mt-4" onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Table
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border mx-4">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Table Number
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {currentTables.map((table) => (
                <tr
                  key={table._id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    {table.tableNumber}
                  </td>
                  <td className="p-4 align-middle">
                    <StatusBadge status={table.status} />
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end space-x-2">
                      {table.status !== 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleClearTable(table)}
                        >
                          <RefreshCw className="h-3 w-3" /> Clear
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleOpenEditDialog(table)}
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                        onClick={() => handleOpenDeleteDialog(table)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between py-4 mx-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">{indexOfFirstItem + 1}</span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, tables.length)}
            </span>{' '}
            of <span className="font-medium">{tables.length}</span>{' '}
            tables
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SelectDropdown
            value={itemsPerPage.toString()}
            onChange={handleItemsPerPageChange}
            className="h-8 w-[70px]"
            options={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "25", label: "25" }
            ]}
          />
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to previous page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <span className="text-sm w-24">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to next page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableList;
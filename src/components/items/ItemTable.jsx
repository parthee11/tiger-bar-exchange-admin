import React from "react";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ItemTypeTag } from "./ItemTypeTag";

/**
 * ItemTable component for displaying items in a table
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - List of items to display
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.getCategoryName - Function to get category name from ID
 * @param {Function} props.formatPrice - Function to format price with currency
 * @param {number} props.indexOfFirstItem - Index of the first item being displayed
 * @param {number} props.indexOfLastItem - Index of the last item being displayed
 * @param {number} props.totalItems - Total number of items (before pagination)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.currentPage - Current page number
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Function to call when page is changed
 * @param {Function} props.onItemsPerPageChange - Function to call when items per page is changed
 * @returns {JSX.Element} ItemTable component
 */
export function ItemTable({ 
  items, 
  onEdit, 
  onDelete, 
  getCategoryName, 
  formatPrice,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) {
  return (
    <>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Floor Price</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hard Liquor</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {items.map((item) => (
                <tr 
                  key={item._id} 
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">{item.name}</td>
                  <td className="p-4 align-middle">
                    <ItemTypeTag type={item.type} />
                  </td>
                  <td className="p-4 align-middle">
                    {item.category && typeof item.category === 'object' 
                      ? item.category.name 
                      : getCategoryName(item.category)}
                  </td>
                  <td className="p-4 align-middle">{formatPrice(item.floorPrice)}</td>
                  <td className="p-4 align-middle">
                    {item.isHardLiquor ? "Yes" : "No"}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                        onClick={() => onDelete(item)}
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
      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">{indexOfFirstItem + 1}</span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span>{' '}
            items
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
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
            <span className="text-sm w-24 text-center">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
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
}
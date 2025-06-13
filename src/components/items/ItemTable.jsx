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
 * @returns {JSX.Element} ItemTable component
 */
export function ItemTable({ items, onEdit, onDelete, getCategoryName, formatPrice }) {
  return (
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
  );
}
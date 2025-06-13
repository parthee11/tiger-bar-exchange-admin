import { Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

/**
 * CategoryTable component for displaying categories in a table
 * 
 * @param {Object} props - Component props
 * @param {Array} props.categories - List of categories to display
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.getCategoryTypeColor - Function to get color class based on category type
 * @returns {JSX.Element} CategoryTable component
 */
export function CategoryTable({ categories, onEdit, onDelete, getCategoryTypeColor }) {
  if (categories.length === 0) {
    return null;
  }

  return (
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
            {categories.map((category) => (
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
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 text-red-500 hover:text-red-700"
                      onClick={() => onDelete(category)}
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
import { Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

/**
 * MixerTable component to display a list of mixers
 * 
 * @param {Object} props - Component props
 * @param {Array} props.mixers - Array of mixer objects to display
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.formatPrice - Function to format price values
 * @returns {React.ReactElement} MixerTable component
 */
export function MixerTable({ mixers, onEdit, onDelete, formatPrice }) {
  return (
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
            {mixers.map((mixer) => (
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
                      onClick={() => onEdit(mixer)}
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 text-red-500 hover:text-red-700"
                      onClick={() => onDelete(mixer)}
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
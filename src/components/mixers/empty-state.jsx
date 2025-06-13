import { Plus, Wine } from "lucide-react";
import { Button } from "../ui/button";

/**
 * EmptyState component to display when no mixers are found
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAdd - Function to call when add button is clicked
 * @returns {React.ReactElement} EmptyState component
 */
export function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-gray-400">
        <Wine className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium">No mixers found</h3>
      <p className="text-sm text-gray-500 mt-2">
        Get started by adding your first mixer.
      </p>
      <Button className="mt-4" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" /> Add Your First Mixer
      </Button>
    </div>
  );
}
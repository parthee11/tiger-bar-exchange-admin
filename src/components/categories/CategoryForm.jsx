import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select-advanced";

/**
 * CategoryForm component for adding or editing categories
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data object with name, type, and description
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleSelectChange - Function to handle select changes
 * @returns {JSX.Element} CategoryForm component
 */
export function CategoryForm({ formData, handleInputChange, handleSelectChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category Name <span className="text-red-500">*</span></label>
        <Input 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter category name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
        <Select 
          value={formData.type} 
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="drinks">Drinks</SelectItem>
            <SelectItem value="sheesha">Sheesha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea 
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter category description (optional)"
          rows={3}
        />
      </div>
    </div>
  );
}
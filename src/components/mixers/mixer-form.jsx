import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

/**
 * MixerForm component for adding or editing a mixer
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data object with name, price, and available properties
 * @param {Function} props.onInputChange - Function to handle input changes
 * @param {Function} props.onCheckboxChange - Function to handle checkbox changes
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {Function} props.onCancel - Function to handle form cancellation
 * @param {string} props.submitText - Text for the submit button
 * @param {string} props.error - Error message to display
 * @returns {React.ReactElement} MixerForm component
 */
export function MixerForm({ 
  formData, 
  onInputChange, 
  onCheckboxChange, 
  onSubmit, 
  onCancel, 
  submitText, 
  error 
}) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter mixer name"
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={onInputChange}
          placeholder="Enter price"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="available"
          checked={formData.available}
          onCheckedChange={onCheckboxChange}
        />
        <Label htmlFor="available">Available</Label>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  );
}
import { Button } from "../ui/button";
import { Modal } from "../ui/Modal";
import { CategoryForm } from "./CategoryForm";

/**
 * CategoryAddModal component for adding a new category
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Object} props.formData - Form data object with name, type, and description
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleSelectChange - Function to handle select changes
 * @param {Function} props.handleAddCategory - Function to handle adding a category
 * @param {string|null} props.error - Error message to display
 * @returns {JSX.Element} CategoryAddModal component
 */
export function CategoryAddModal({ 
  isOpen, 
  onClose, 
  formData, 
  handleInputChange, 
  handleSelectChange, 
  handleAddCategory,
  error
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Category">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <CategoryForm 
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
      />
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAddCategory}>
          Add Category
        </Button>
      </div>
    </Modal>
  );
}
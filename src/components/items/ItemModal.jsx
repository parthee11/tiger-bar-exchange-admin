import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { ItemForm } from "./ItemForm";

/**
 * ItemModal component for adding/editing items
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Function} props.onSubmit - Function to call when the form is submitted
 * @param {string} props.title - Modal title
 * @param {string} props.submitText - Text for the submit button
 * @param {Object} props.formData - Form data
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleTypeChange - Function to handle type changes
 * @param {Function} props.handleCategoryChange - Function to handle category changes
 * @param {Function} props.handleBranchChange - Function to handle branch changes
 * @param {Function} props.handleCheckboxChange - Function to handle checkbox changes
 * @param {Array} props.categories - List of categories
 * @param {Array} props.branches - List of branches
 * @param {string} props.error - Error message
 * @returns {JSX.Element} ItemModal component
 */
export function ItemModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  submitText, 
  formData, 
  handleInputChange, 
  handleTypeChange, 
  handleCategoryChange, 
  handleBranchChange, 
  handleCheckboxChange, 
  categories, 
  branches,
  error
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ItemForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleTypeChange={handleTypeChange}
          handleCategoryChange={handleCategoryChange}
          handleBranchChange={handleBranchChange}
          handleCheckboxChange={handleCheckboxChange}
          categories={categories}
          branches={branches}
          error={error}
        />
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select-advanced";
import { BranchCheckboxList } from "./BranchCheckboxList";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

/**
 * ItemForm component for adding/editing items
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleTypeChange - Function to handle type changes
 * @param {Function} props.handleCategoryChange - Function to handle category changes
 * @param {Function} props.handleBranchChange - Function to handle branch changes
 * @param {Function} props.handleCheckboxChange - Function to handle checkbox changes
 * @param {Array} props.categories - List of categories
 * @param {Array} props.branches - List of branches
 * @param {string} props.error - Error message
 * @returns {JSX.Element} ItemForm component
 */
export function ItemForm({ 
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
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Item Name <span className="text-red-500">*</span></label>
        <Input 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter item name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
        <Select 
          value={formData.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select item type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="drinks">Drinks</SelectItem>
            <SelectItem value="sheesha">Sheesha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
        <Select 
          value={formData.category} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Branches <span className="text-red-500">*</span></label>
        <BranchCheckboxList 
          branches={branches}
          selectedBranches={formData.branches}
          onBranchChange={handleBranchChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Floor Price <span className="text-red-500">*</span></label>
        <Input 
          name="floorPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.floorPrice}
          onChange={handleInputChange}
          placeholder="Enter floor price"
          required
        />
      </div>
      {formData.type === 'drinks' && (
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox"
            id="isHardLiquor"
            checked={formData.isHardLiquor}
            onChange={(e) => handleCheckboxChange(e.target.checked, 'isHardLiquor')}
            className="mr-2"
          />
          <label 
            htmlFor="isHardLiquor"
            className="text-sm font-medium leading-none"
          >
            Is Hard Liquor
          </label>
        </div>
      )}

      {/* Show in Menu toggle */}
      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="showInMenu" className="text-sm font-medium">Show in Menu</Label>
        <Switch
          id="showInMenu"
          checked={formData.showInMenu !== false}
          onCheckedChange={(checked) => handleCheckboxChange(checked, 'showInMenu')}
        />
      </div>
    </div>
  );
}
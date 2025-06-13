import React from "react";

/**
 * BranchCheckboxList component for selecting branches
 * 
 * @param {Object} props - Component props
 * @param {Array} props.branches - List of branches
 * @param {Array} props.selectedBranches - List of selected branch IDs
 * @param {Function} props.onBranchChange - Function to call when a branch is selected/deselected
 * @param {string} props.idPrefix - Prefix for checkbox IDs to ensure uniqueness
 * @returns {JSX.Element} BranchCheckboxList component
 */
export function BranchCheckboxList({ branches, selectedBranches, onBranchChange, idPrefix = "branch" }) {
  return (
    <div className="space-y-2 mt-1 border rounded-md p-3">
      {branches.map(branch => (
        <div key={branch._id} className="flex items-center space-x-2">
          <input 
            type="checkbox"
            id={`${idPrefix}-${branch._id}`}
            checked={selectedBranches.includes(branch._id)}
            onChange={() => onBranchChange(branch._id)}
            className="mr-2"
          />
          <label 
            htmlFor={`${idPrefix}-${branch._id}`}
            className="text-sm font-medium leading-none"
          >
            {branch.name}
          </label>
        </div>
      ))}
    </div>
  );
}
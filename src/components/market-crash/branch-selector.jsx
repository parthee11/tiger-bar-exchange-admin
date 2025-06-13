import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectOption } from "../../components/ui/select";

/**
 * BranchSelector component for selecting a branch
 * 
 * @param {Object} props - Component props
 * @param {Array} props.branches - List of branches
 * @param {string} props.selectedBranch - Currently selected branch ID
 * @param {Function} props.onBranchChange - Function to call when branch selection changes
 * @param {boolean} props.loading - Whether branches are loading
 * @returns {JSX.Element} BranchSelector component
 */
export function BranchSelector({ branches, selectedBranch, onBranchChange, loading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Branch</CardTitle>
        <CardDescription>
          Choose a branch to manage market crash
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="branch">
            Branch
          </label>
          <Select
            id="branch"
            value={selectedBranch}
            onChange={onBranchChange}
            disabled={loading}
          >
            <SelectOption value="">Select a branch</SelectOption>
            {branches.map((branch) => (
              <SelectOption key={branch._id} value={branch._id}>
                {branch.name}
              </SelectOption>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
/* eslint-disable no-unused-vars */
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "../ui/button";

/**
 * FilterBar component for filtering reservations
 * 
 * @param {Object} props
 * @param {string} props.filter - Current filter value
 * @param {Function} props.onFilterChange - Function to call when filter changes
 * @param {Function} props.onRefresh - Function to call when refresh button is clicked
 * @returns {JSX.Element}
 */
export function FilterBar({ filter, onFilterChange, onRefresh }) {
  return (
    <div className="flex items-center gap-2">
      {/* <select 
        className="rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select> */}
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1" 
        onClick={onRefresh}
      >
        <Filter className="h-4 w-4" /> Refresh
      </Button>
    </div>
  );
}
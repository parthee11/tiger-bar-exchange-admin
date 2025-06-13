import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

/**
 * Error message component
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @returns {JSX.Element} Error message component
 */
export function ErrorMessage({ message }) {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        {message}
      </div>
    </div>
  );
}

/**
 * Loading spinner component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @returns {JSX.Element} Loading spinner component
 */
export function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  return (
    <div className="py-4 flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
    </div>
  );
}

/**
 * Search input component
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Function to call when search value changes
 * @param {Function} props.onClear - Function to call when clear button is clicked
 * @param {string} props.placeholder - Placeholder text
 * @returns {JSX.Element} Search input component
 */
export function SearchInput({ value, onChange, onClear, placeholder = "Search..." }) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <Button variant="outline" onClick={onClear}>Clear</Button>
    </div>
  );
}

/**
 * Empty state component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @returns {JSX.Element} Empty state component
 */
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-8">
      {icon && (
        <div className="rounded-full bg-blue-100 p-3">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-medium text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </div>
  );
}
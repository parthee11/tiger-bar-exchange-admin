import React from "react";
import { Check, Clock, X, AlertTriangle } from "lucide-react";

/**
 * StatusBadge component for displaying reservation status
 * 
 * @param {Object} props
 * @param {string} props.status - The status to display
 * @returns {JSX.Element}
 */
export function StatusBadge({ status }) {
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Check className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <X className="h-4 w-4 mr-1" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      getStatusBadgeClass(status || 'unknown')
    }`}>
      {getStatusIcon(status)}
      {status 
        ? status.charAt(0).toUpperCase() + status.slice(1) 
        : 'Unknown'}
    </span>
  );
}
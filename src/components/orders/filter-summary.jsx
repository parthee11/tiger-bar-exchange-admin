import { format, parseISO } from "date-fns";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";

export function FilterSummary({
  loading,
  searchTerm,
  selectedBranch,
  startDate,
  endDate,
  filteredOrders,
  orders,
  branches,
  handleRefresh
}) {
  const hasActiveFilters = searchTerm || selectedBranch || startDate || endDate;
  
  if (!hasActiveFilters || loading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleRefresh}
        disabled={loading}
      >
        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> 
        Refresh
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {filteredOrders.length} of {orders.length} orders
        {searchTerm && <span> (filtered by search)</span>}
        {selectedBranch && (
          <span> (filtered by branch: {branches.find(b => b._id === selectedBranch)?.name || 'Unknown'})</span>
        )}
        {(startDate || endDate) && (
          <span> (filtered by date: {startDate ? format(parseISO(startDate), 'MMM d, yyyy') : 'any'} to {endDate ? format(parseISO(endDate), 'MMM d, yyyy') : 'any'})</span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleRefresh}
        disabled={loading}
      >
        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> 
        Refresh
      </Button>
    </div>
  );
}
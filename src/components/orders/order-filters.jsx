import { Input } from "../ui/input";
import { Select, SelectOption } from "../ui/select";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";

export function OrderFilters({
  searchTerm,
  setSearchTerm,
  selectedBranch,
  setSelectedBranch,
  selectedStatus,
  setSelectedStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  branches,
  branchesLoading,
  clearFilters,
  hasActiveFilters
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search by customer name, order ID or table..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={branchesLoading}
            className="w-full"
          >
            <SelectOption value="">All Branches</SelectOption>
            {branches.map(branch => (
              <SelectOption key={branch._id} value={branch._id}>
                {branch.name}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div className="w-[150px]">
          <Select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full"
          >
            <SelectOption value="">All Statuses</SelectOption>
            <SelectOption value="pending">Pending</SelectOption>
            <SelectOption value="delivered">Delivered</SelectOption>
            <SelectOption value="cancelled">Cancelled</SelectOption>
          </Select>
        </div>
        <div>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Date Range:</span>
        </div>
        <div className="flex gap-2 items-center">
          <div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <span className="text-sm text-muted-foreground">to</span>
          <div>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
              min={startDate}
            />
          </div>
        </div>
      </div>
    </>
  );
}
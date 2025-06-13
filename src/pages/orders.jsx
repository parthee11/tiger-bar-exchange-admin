import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { OrderDetails } from "../components/order-details";
import { OrderFilters } from "../components/orders/order-filters";
import { OrderTable } from "../components/orders/order-table";
import { FilterSummary } from "../components/orders/filter-summary";
import { useToast } from "../components/ui/use-toast";
import ordersApi from "../api/orders";
import branchesApi from "../api/branches";
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from "date-fns";

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setBranchesLoading(true);
      
      // Fetch orders
      const ordersResponse = await ordersApi.getAllOrders();
      setOrders(ordersResponse.data || []);
      
      // Fetch branches
      const branchesResponse = await branchesApi.getBranches();
      setBranches(branchesResponse.data || []);
      
      setError(null);
      
      // Show success toast on refresh
      if (!loading) {
        toast({
          title: "Data Refreshed",
          description: "Orders data has been updated",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to load orders data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setBranchesLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  
  // Function to refresh orders data
  const handleRefresh = () => {
    fetchData();
  };

  // Format date from ISO string
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge variant based on status
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Calculate total items in an order
  const getTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBranch("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset",
      variant: "default",
    });
  };

  // Filter orders based on search term, branch, status, and date range
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.tableNumber).includes(searchTerm);
    
    // Branch filter
    const matchesBranch = selectedBranch === "" || order.branch === selectedBranch;
    
    // Status filter
    const matchesStatus = selectedStatus === "" || 
      (order.status && order.status.toLowerCase() === selectedStatus.toLowerCase());
    
    // Date filter
    let matchesDateRange = true;
    if (startDate && order.createdAt) {
      const orderDate = parseISO(order.createdAt);
      const filterStartDate = startOfDay(parseISO(startDate));
      matchesDateRange = isAfter(orderDate, filterStartDate) || orderDate.getTime() === filterStartDate.getTime();
    }
    
    if (endDate && order.createdAt && matchesDateRange) {
      const orderDate = parseISO(order.createdAt);
      const filterEndDate = endOfDay(parseISO(endDate));
      matchesDateRange = isBefore(orderDate, filterEndDate) || orderDate.getTime() === filterEndDate.getTime();
    }
    
    return matchesSearch && matchesBranch && matchesStatus && matchesDateRange;
  });
  
  // Handle opening order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  // Handle order status change
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      // Update the order status in the API using the appropriate endpoint
      if (newStatus === "delivered") {
        await ordersApi.deliverOrder(orderId);
      } else if (newStatus === "cancelled") {
        await ordersApi.cancelOrder(orderId);
      } else {
        await ordersApi.updateOrderStatus(orderId, newStatus);
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      return true;
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedBranch || selectedStatus || startDate || endDate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>
      
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        branches={branches}
        branchesLoading={branchesLoading}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              View and manage customer orders
            </CardDescription>
          </div>
          <FilterSummary
            loading={loading}
            searchTerm={searchTerm}
            selectedBranch={selectedBranch}
            selectedStatus={selectedStatus}
            startDate={startDate}
            endDate={endDate}
            filteredOrders={filteredOrders}
            orders={orders}
            branches={branches}
            handleRefresh={handleRefresh}
          />
        </CardHeader>
        <CardContent>
          <OrderTable
            loading={loading}
            error={error}
            filteredOrders={filteredOrders}
            branches={branches}
            handleViewOrder={handleViewOrder}
            getStatusVariant={getStatusVariant}
            formatDate={formatDate}
            getTotalItems={getTotalItems}
          />
        </CardContent>
      </Card>
      
      <OrderDetails 
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onStatusChange={handleOrderStatusChange}
      />
    </div>
  );
}
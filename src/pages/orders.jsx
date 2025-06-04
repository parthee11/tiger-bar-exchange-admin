import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Eye, Loader2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select, SelectOption } from "../components/ui/select"
import ordersApi from "../api/orders"
import branchesApi from "../api/branches"
import { format } from "date-fns"
import { OrderDetails } from "../components/order-details"

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchesLoading, setBranchesLoading] = useState(true);


  useEffect(() => {
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
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
        setBranchesLoading(false);
      }
    };

    fetchData();
  }, []);

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
      case "completed":
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

  // Filter orders based on search term and branch
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.tableNumber).includes(searchTerm);
    
    // Branch filter
    const matchesBranch = selectedBranch === "" || order.branch === selectedBranch;
    
    return matchesSearch && matchesBranch;
  });
  
  // Handle opening order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  // Handle order status change
  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order._id === orderId 
        ? { ...order, status: newStatus } 
        : order
    ));
    
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>
      
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
        <div>
          {(searchTerm || selectedBranch) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedBranch("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              View and manage customer orders
            </CardDescription>
          </div>
          {!loading && (searchTerm || selectedBranch) && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
              {searchTerm && <span> (filtered by search)</span>}
              {selectedBranch && (
                <span> (filtered by branch: {branches.find(b => b._id === selectedBranch)?.name || 'Unknown'})</span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-sm">
                    <th className="p-3 text-left font-medium">Order ID</th>
                    <th className="p-3 text-left font-medium">Table</th>
                    <th className="p-3 text-left font-medium">Customer</th>
                    <th className="p-3 text-left font-medium">Branch</th>
                    <th className="p-3 text-left font-medium">Items</th>
                    <th className="p-3 text-left font-medium">Total</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Date & Time</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="p-3 font-medium">{order._id.substring(order._id.length - 8)}</td>
                        <td className="p-3">Table {order.tableNumber}</td>
                        <td className="p-3">{order.user.name}</td>
                        <td className="p-3">
                          {order.branch ? 
                            branches.find(b => b._id === order.branch)?.name || 'Unknown' : 
                            'Not assigned'}
                        </td>
                        <td className="p-3">{getTotalItems(order.items)}</td>
                        <td className="p-3">${order.totalAmount.toFixed(2)}</td>
                        <td className="p-3">
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-3">{formatDate(order.createdAt)}</td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      <OrderDetails 
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onStatusChange={handleOrderStatusChange}
      />
    </div>
  )
}
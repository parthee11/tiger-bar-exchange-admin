import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { OrderDetails } from '../components/order-details';
import { OrderFilters } from '../components/orders/order-filters';
import { OrderTable } from '../components/orders/order-table';
import { FilterSummary } from '../components/orders/filter-summary';
import { useToast } from '../components/ui/use-toast';
import ordersApi from '../api/orders';
import branchesApi from '../api/branches';
import tablesApi from '../api/tables';
import socketService from '../services/socketService';
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay, differenceInHours } from 'date-fns';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
          title: 'Data Refreshed',
          description: 'Orders data has been updated',
          variant: 'default',
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');

      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to load orders data. Please try again.',
        variant: 'destructive',
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

  // Listen for real-time order updates
  useEffect(() => {
    // Listen for new orders
    const removeOrderPlacedListener = socketService.addListener('order_placed', (newOrder) => {
      console.log('New order received via socket:', newOrder);
      
      setOrders((prevOrders) => {
        // Avoid duplicates
        if (prevOrders.some((o) => o._id === newOrder._id)) {
          return prevOrders;
        }
        return [newOrder, ...prevOrders];
      });

      toast({
        title: 'New Order',
        description: `New order from Table ${newOrder.tableNumber}`,
      });
    });

    // Also listen for status updates if they are broadcasted
    const removeStatusUpdateListener = socketService.addListener('order_status_updated', (updatedOrder) => {
      setOrders((prevOrders) => 
        prevOrders.map((o) => {
          if (o._id === updatedOrder._id) {
            // Preserve user object if the update only has user ID
            const mergedUser = (typeof updatedOrder.user !== 'object' && typeof o.user === 'object') 
              ? o.user 
              : updatedOrder.user;
            return { ...o, ...updatedOrder, user: mergedUser };
          }
          return o;
        })
      );
    });

    const removeOrderCancelledListener = socketService.addListener('order_cancelled', (cancelledOrder) => {
      setOrders((prevOrders) => 
        prevOrders.map((o) => {
          if (o._id === cancelledOrder._id) {
            // Preserve user object if the update only has user ID
            const mergedUser = (typeof cancelledOrder.user !== 'object' && typeof o.user === 'object') 
              ? o.user 
              : cancelledOrder.user;
            return { ...o, ...cancelledOrder, user: mergedUser };
          }
          return o;
        })
      );
    });

    return () => {
      if (removeOrderPlacedListener) removeOrderPlacedListener();
      if (removeStatusUpdateListener) removeStatusUpdateListener();
      if (removeOrderCancelledListener) removeOrderCancelledListener();
    };
  }, []);

  // Function to refresh orders data
  const handleRefresh = () => {
    fetchData();
  };

  // Sync selectedOrder with updated orders data
  useEffect(() => {
    if (selectedOrder && orders.length > 0) {
      // Group all orders to get the latest grouped state
      const grouped = groupOrders(orders);
      
      // Find the updated version of our selected order
      const updatedOrder = grouped.find(
        (g) => g._id === selectedOrder._id || 
        (selectedOrder.isGroup && g.isGroup && g.orderIds.some(id => selectedOrder.orderIds.includes(id)))
      );
      
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders]);

  // Format date from ISO string
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  // Calculate total items in an order
  const getTotalItems = (items) => items.reduce((total, item) => total + item.quantity, 0);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setStartDate('');
    setEndDate('');

    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset',
      variant: 'default',
    });
  };

  // Handle opening order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Group orders by branch, table, and user
  const groupOrders = (ordersToGroup) => {
    const grouped = [];
    const groups = {};

    // Sort by date descending first to get the latest orders as base
    const sortedOrders = [...ordersToGroup].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt),
    );

    sortedOrders.forEach((order) => {
      const userId = typeof order.user === 'object' ? order.user?._id : order.user;
      const branchId = typeof order.branch === 'object' ? order.branch?._id : order.branch;
      const key = `${branchId}-${order.tableNumber}-${userId}`;

      const existingGroup = groups[key];
      const orderDate = new Date(order.createdAt);

      // Only group if they are within 8 hours of each other
      const shouldGroup = existingGroup &&
        (Math.abs(differenceInHours(new Date(existingGroup.createdAt), orderDate)) < 8);

      if (!shouldGroup) {
        const newGroup = {
          ...order,
          orderIds: [order._id],
          totalAmount: order.totalAmount,
          items: [...order.items],
          isGroup: true,
          allOrders: [order],
          allPaid: order.status === 'cancelled' || order.paymentStatus === 'paid',
          allDelivered: order.status === 'cancelled' || order.status === 'delivered',
        };
        groups[key] = newGroup;
        grouped.push(newGroup);
      } else {
        // If the current order has a more complete user object than the existing group, update it
        if (typeof order.user === 'object' && typeof existingGroup.user !== 'object') {
          existingGroup.user = order.user;
        }
        
        existingGroup.orderIds.push(order._id);
        existingGroup.totalAmount += order.totalAmount;
        existingGroup.items = [...existingGroup.items, ...order.items];
        existingGroup.allOrders.push(order);
        
        // Update allPaid: if any is not paid and not cancelled, allPaid is false
        if (order.status !== 'cancelled' && order.paymentStatus !== 'paid') {
          existingGroup.allPaid = false;
        }

        // Update allDelivered: if any is not delivered and not cancelled, allDelivered is false
        if (order.status !== 'cancelled' && order.status !== 'delivered') {
          existingGroup.allDelivered = false;
        }

        // Update status: if any is pending/preparing/ready, the group is active
        const statusPriority = { 'pending': 4, 'preparing': 3, 'ready': 2, 'delivered': 1, 'cancelled': 0 };
        if (statusPriority[order.status] > statusPriority[existingGroup.status]) {
          existingGroup.status = order.status;
        }
      }
    });

    return grouped;
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedBranch || startDate || endDate;

  // Group all orders first
  const allGroupedOrders = groupOrders(orders);

  // Filter grouped orders based on search term, branch, and date range
  const filteredGroupedOrders = allGroupedOrders.filter((group) => {
    // Search filter
    const userName = typeof group.user === 'object' ? group.user?.name : '';
    const matchesSearch = searchTerm === '' ||
      (userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      group._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.isGroup && group.orderIds.some((id) => id.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      String(group.tableNumber).includes(searchTerm);

    // Branch filter
    const matchesBranch = selectedBranch === '' || group.branch === selectedBranch;

    // Date filter
    let matchesDateRange = true;
    if (startDate && group.createdAt) {
      const orderDate = parseISO(group.createdAt);
      const filterStartDate = startOfDay(parseISO(startDate));
      matchesDateRange = isAfter(orderDate, filterStartDate) || orderDate.getTime() === filterStartDate.getTime();
    }

    if (endDate && group.createdAt && matchesDateRange) {
      const orderDate = parseISO(group.createdAt);
      const filterEndDate = endOfDay(parseISO(endDate));
      matchesDateRange = isBefore(orderDate, filterEndDate) || orderDate.getTime() === filterEndDate.getTime();
    }

    return matchesSearch && matchesBranch && matchesDateRange;
  });

  // Handle close table
  const handleCloseTable = async (group) => {
    try {
      setLoading(true);

      // Check if all orders are paid and delivered
      const isPaid = group.isGroup ? group.allPaid : group.paymentStatus === 'paid';
      const isDelivered = group.isGroup ? group.allDelivered : group.status === 'delivered';

      if (!isPaid || !isDelivered) {
        toast({
          title: 'Cannot Close Table',
          description: 'All orders must be paid and delivered (or cancelled) before closing the table.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 1. Find table ID to mark as available
      const branch = branches.find((b) => b._id === group.branch);
      if (branch && branch.tables) {
        const table = branch.tables.find((t) => String(t.tableNumber) === String(group.tableNumber));
        if (table) {
          await tablesApi.updateTableStatus(group.branch, table._id, 'available');
        }
      }

      // 2. Mark all orders in the group as 'closed' in the backend
      const orderIds = group.isGroup ? group.orderIds : [group._id];
      const updateOrderPromises = orderIds.map((id) => ordersApi.updateOrderStatus(id, 'closed'));
      await Promise.all(updateOrderPromises);

      toast({
        title: 'Table Closed',
        description: `Table ${group.tableNumber} has been closed and marked as available.`,
      });

      // Refresh both orders and branches to update the UI
      await fetchData();
    } catch (error) {
      console.error('Error closing table:', error);
      toast({
        title: 'Error',
        description: 'Failed to close table. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle order status change
  const handleOrderStatusChange = async (orderId, newStatus, updateGroup = false) => {
    try {
      let orderIdsToUpdate = [orderId];

      if (updateGroup) {
        // Find the group
        const group = allGroupedOrders.find((g) => g._id === orderId);
        if (group && group.isGroup) {
          orderIdsToUpdate = group.orderIds;
        }
      }

      // Update the order status in the API for all identified orders
      const updatePromises = orderIdsToUpdate.map((id) => {
        if (newStatus === 'delivered') {
          return ordersApi.deliverOrder(id);
        } else if (newStatus === 'cancelled') {
          return ordersApi.cancelOrder(id);
        } else {
          return ordersApi.updateOrderStatus(id, newStatus);
        }
      });

      await Promise.all(updatePromises);

      // Update local state
      setOrders((prevOrders) => 
        prevOrders.map((o) =>
          orderIdsToUpdate.includes(o._id)
            ? { ...o, status: newStatus }
            : o,
        )
      );

      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  // Handle payment collection
  const handleCollectPayment = async (orderId, paymentMethod = 'cash', updateGroup = false) => {
    try {
      let orderIdsToUpdate = [orderId];

      if (updateGroup) {
        const group = allGroupedOrders.find((g) => g._id === orderId);
        if (group && group.isGroup) {
          orderIdsToUpdate = group.orderIds;
        }
      }

      const updatePromises = orderIdsToUpdate.map((id) =>
        ordersApi.collectPayment(id, paymentMethod),
      );

      await Promise.all(updatePromises);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          orderIdsToUpdate.includes(o._id)
            ? { ...o, paymentStatus: 'paid', paymentMethod, paidAt: new Date().toISOString() }
            : o,
        )
      );

      toast({
        title: 'Payment Collected',
        description: `Successfully marked ${orderIdsToUpdate.length} order(s) as paid via ${paymentMethod}.`,
      });

      return true;
    } catch (error) {
      console.error('Failed to collect payment:', error);
      toast({
        title: 'Payment Collection Failed',
        description: error.message || 'Failed to update payment status. Please try again.',
        variant: 'destructive',
      });
      throw error;
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

      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
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
            startDate={startDate}
            endDate={endDate}
            filteredOrders={filteredGroupedOrders}
            orders={orders}
            branches={branches}
            handleRefresh={handleRefresh}
          />
        </CardHeader>
        <CardContent>
          <OrderTable
            loading={loading}
            error={error}
            filteredOrders={filteredGroupedOrders}
            branches={branches}
            handleViewOrder={handleViewOrder}
            handleCloseTable={handleCloseTable}
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
        onCollectPayment={handleCollectPayment}
      />
    </div>
  );
}

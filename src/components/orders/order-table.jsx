import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Eye, Loader2, XCircle } from 'lucide-react';

export function OrderTable({
  loading,
  error,
  filteredOrders,
  branches,
  handleViewOrder,
  handleCloseTable,
  formatDate,
  getTotalItems,
}) {
  const isTableOccupied = (order) => {
    if (!order || !order.branch || !order.tableNumber || !order.user) return false;

    const branch = branches.find((b) => b._id === order.branch);
    if (!branch || !branch.tables) return false;

    const table = branch.tables.find((t) => String(t.tableNumber) === String(order.tableNumber));
    if (!table || table.status !== 'occupied') return false;

    // Get order user ID safely
    const orderUserId = typeof order.user === 'object' ? order.user._id : order.user;

    // Check if table is occupied AND if it was occupied by the user associated with this order
    // We check !table.occupiedBy for backward compatibility with orders placed before this change
    const isOwner = !table.occupiedBy || String(table.occupiedBy) === String(orderUserId);

    return isOwner;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50 text-sm">
            <th className="p-3 text-left font-medium">Order ID</th>
            <th className="p-3 text-left font-medium">Table</th>
            <th className="p-3 text-left font-medium">Customer</th>
            <th className="p-3 text-left font-medium">Branch</th>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-left font-medium">Items</th>
            <th className="p-3 text-left font-medium">Total</th>
            <th className="p-3 text-left font-medium">Date & Time</th>
            <th className="p-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-4 text-center text-muted-foreground">
                No orders found
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {order.isGroup && order.orderIds && order.orderIds.length > 1 ? (
                      order.orderIds.map((id) => (
                        <Badge key={id} variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-5">
                          #{id.substring(id.length - 6)}
                        </Badge>
                      ))
                    ) : (
                      <span className="font-medium font-mono text-sm">
                        #{order._id.substring(order._id.length - 8)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span>Table {order.tableNumber}</span>
                  </div>
                </td>
                <td className="p-3">
                  {typeof order.user === 'object' ? order.user.name : 'Customer'}
                </td>
                <td className="p-3">
                  {order.branch ?
                    branches.find((b) => b._id === order.branch)?.name || 'Unknown' :
                    'Not assigned'}
                </td>
                <td className="p-3">
                  {order.status === 'cancelled' ? (
                    <Badge variant="danger" className="bg-red-100 text-red-700 border-red-200">
                      Cancelled
                    </Badge>
                  ) : order.status === 'closed' ? (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                      Closed
                    </Badge>
                  ) : isTableOccupied(order) ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      Table Open
                    </Badge>
                  ) : (order.allPaid && order.allDelivered) ? (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                      Closed
                    </Badge>
                  ) : (
                    <Badge
                      variant={
                        order.status === 'pending' || order.status === 'preparing' ? 'warning' :
                        order.status === 'ready' ? 'info' : 'success'
                      }
                      className={
                        order.status === 'pending' || order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-green-100 text-green-700 border-green-200'
                      }
                    >
                      {(order.status || 'Unknown').charAt(0).toUpperCase() + (order.status || 'Unknown').slice(1)}
                    </Badge>
                  )}
                </td>
                <td className="p-3">{getTotalItems(order.items)}</td>
                <td className="p-3">{(order.totalAmount || 0).toFixed(2)} AED</td>
                <td className="p-3">{formatDate(order.createdAt)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-3 w-3" /> View
                    </Button>

                    {((order.isGroup ? (order.allPaid && order.allDelivered) : (order.paymentStatus === 'paid' && order.status === 'delivered')) && isTableOccupied(order)) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                        onClick={() => handleCloseTable(order)}
                      >
                        <XCircle className="h-3 w-3" /> Close Table
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
      </tbody>
      </table>
    </div>
  );
}

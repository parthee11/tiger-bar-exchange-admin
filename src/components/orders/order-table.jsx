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
    const branch = branches.find((b) => b._id === order.branch);
    if (!branch || !branch.tables) return false;
    const table = branch.tables.find((t) => t.tableNumber === order.tableNumber);
    return table?.status === 'occupied';
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
                <td className="p-3">{order.user.name}</td>
                <td className="p-3">
                  {order.branch ?
                    branches.find((b) => b._id === order.branch)?.name || 'Unknown' :
                    'Not assigned'}
                </td>
                <td className="p-3">
                  {isTableOccupied(order) ? (
                    <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                      Closed
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

                    {order.allPaid && order.allDelivered && isTableOccupied(order) && (
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

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function OrderTable({
  loading,
  error,
  filteredOrders,
  branches,
  handleViewOrder,
  getStatusVariant,
  formatDate,
  getTotalItems
}) {
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
              <td colSpan="9" className="p-4 text-center text-muted-foreground">
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
                <td className="p-3">{order.totalAmount.toFixed(2)} AED</td>
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
  );
}
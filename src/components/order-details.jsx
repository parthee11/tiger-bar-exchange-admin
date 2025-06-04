import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { X, Check, Clock, AlertTriangle, MapPin } from "lucide-react";
import ordersApi from "../api/orders";
import branchesApi from "../api/branches";

export function OrderDetails({ order, isOpen, onClose, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [branchInfo, setBranchInfo] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  
  // Fetch branch information when order changes
  useEffect(() => {
    const fetchBranchInfo = async () => {
      if (order && order.branchId) {
        try {
          setBranchLoading(true);
          const response = await branchesApi.getBranch(order.branchId);
          setBranchInfo(response.data);
        } catch (error) {
          console.error("Error fetching branch info:", error);
          setBranchInfo(null);
        } finally {
          setBranchLoading(false);
        }
      } else {
        setBranchInfo(null);
      }
    };
    
    // Only fetch branch info if order exists and dialog is open
    if (order && isOpen) {
      fetchBranchInfo();
    }
  }, [order, order?.branchId, isOpen]);

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "PPpp"); // Format: Apr 29, 2023, 7:14 PM
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge variant
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Check className="h-4 w-4 mr-1" />;
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <X className="h-4 w-4 mr-1" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      // Try to use the specific status update endpoint first
      try {
        await ordersApi.updateOrderStatus(order._id, newStatus);
      } catch (statusError) {
        // Fall back to the general update method if the specific endpoint fails
        console.warn("Status update endpoint failed, using general update:", statusError);
        await ordersApi.updateOrder(order._id, { status: newStatus });
      }
      onStatusChange(order._id, newStatus);
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // If no order is provided or dialog is not open, don't render anything
  if (!order || !isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Order Details
            <span className="text-sm ml-2 text-muted-foreground">
              #{order._id.substring(order._id.length - 8)}
            </span>
          </DialogTitle>
          <DialogDescription>
            Created on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            <p><span className="text-muted-foreground">Name:</span> {order.user.name}</p>
            <p><span className="text-muted-foreground">Username:</span> {order.user.username}</p>
            <p><span className="text-muted-foreground">Table:</span> {order.tableNumber}</p>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Branch Information</h3>
              {branchLoading ? (
                <p className="text-sm text-muted-foreground">Loading branch information...</p>
              ) : branchInfo ? (
                <>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Branch:</span> {branchInfo.name}
                  </p>
                  {branchInfo.address && (
                    <p><span className="text-muted-foreground">Address:</span> {branchInfo.address}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {order.branchId ? "Branch information not available" : "No branch assigned"}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Order Information</h3>
            <p>
              <span className="text-muted-foreground">Status:</span> 
              <Badge variant={getStatusVariant(order.status)} className="ml-2 inline-flex items-center">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </p>
            <p><span className="text-muted-foreground">Order ID:</span> {order._id}</p>
            <p><span className="text-muted-foreground">Total Amount:</span> ${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="border rounded-md">
          <div className="bg-muted/50 p-3 border-b">
            <h3 className="font-medium">Order Items</h3>
          </div>
          <div className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm">
                  <th className="p-3 text-left font-medium">Item</th>
                  <th className="p-3 text-left font-medium">Type</th>
                  <th className="p-3 text-left font-medium">Quantity</th>
                  <th className="p-3 text-left font-medium">Mixers</th>
                  <th className="p-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className={index !== order.items.length - 1 ? "border-b" : ""}>
                    <td className="p-3">{item.item.name.replace(/"/g, '')}</td>
                    <td className="p-3 capitalize">{item.item.type}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">
                      {item.mixers && item.mixers.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {item.mixers.map((mixer, i) => (
                            <li key={i} className="text-sm">
                              {mixer.name} x{mixer.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground text-sm">No mixers</span>
                      )}
                    </td>
                    <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-muted/30">
                  <td colSpan="4" className="p-3 text-right font-medium">Total:</td>
                  <td className="p-3 text-right font-medium">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {order.status !== "completed" && (
              <Button 
                variant="success" 
                onClick={() => handleStatusChange("completed")}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 mr-1" /> Mark Completed
              </Button>
            )}
            {order.status !== "cancelled" && (
              <Button 
                variant="destructive" 
                onClick={() => handleStatusChange("cancelled")}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" /> Cancel Order
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
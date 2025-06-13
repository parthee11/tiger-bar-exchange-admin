import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { X, Check, Clock, AlertTriangle, MapPin } from "lucide-react";
import branchesApi from "../api/branches";
import { useToast } from "./ui/use-toast";

export function OrderDetails({ order, isOpen, onClose, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [branchInfo, setBranchInfo] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch branch information when order changes
  useEffect(() => {
    const fetchBranchInfo = async () => {
      if (order && order.branch) {
        try {
          setBranchLoading(true);
          const response = await branchesApi.getBranch(order.branch);
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
  }, [order, isOpen]);

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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
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
      
      // Let the parent component handle the API call
      await onStatusChange(order._id, newStatus);
      
      // Show success toast
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // If no order is provided or dialog is not open, don't render anything
  if (!order || !isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            {order.user ? (
              <>
                <p><span className="text-muted-foreground">Name:</span> {order.user.name || 'N/A'}</p>
                <p><span className="text-muted-foreground">Username:</span> {order.user.username || 'N/A'}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Customer information not available</p>
            )}
            <p><span className="text-muted-foreground">Table:</span> {order.tableNumber || 'N/A'}</p>
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
                  {order.branch ? "Branch information not available" : "No branch assigned"}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Order Information</h3>
            <p>
              <span className="text-muted-foreground">Status:</span> 
              {order.status ? (
                <Badge variant={getStatusVariant(order.status)} className="ml-2 inline-flex items-center">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              ) : (
                <span className="ml-2">Unknown</span>
              )}
            </p>
            <p><span className="text-muted-foreground">Order ID:</span> {order._id || 'N/A'}</p>
            <p><span className="text-muted-foreground">Total Amount:</span> {(order.totalAmount || 0).toFixed(2)} AED</p>
          </div>
        </div>

        <div className="border rounded-md">
          <div className="bg-muted/50 p-3 border-b">
            <h3 className="font-medium">Order Items</h3>
          </div>
          <div className="p-0 overflow-x-auto">
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
                {order.items && order.items.length > 0 ? (
                  <>
                    {order.items.map((item, index) => (
                      <tr key={index} className={index !== order.items.length - 1 ? "border-b" : ""}>
                        <td className="p-3">
                          {item.item && item.item.name 
                            ? item.item.name.replace(/"/g, '') 
                            : 'Unknown Item'}
                        </td>
                        <td className="p-3 capitalize">
                          {item.item && item.item.type ? item.item.type : 'N/A'}
                        </td>
                        <td className="p-3">{item.quantity || 0}</td>
                        <td className="p-3">
                          {item.mixers && item.mixers.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {item.mixers.map((mixer, i) => (
                                <li key={i} className="text-sm">
                                  {mixer && mixer.name ? `${mixer.name} x${mixer.quantity || 1}` : 'Unknown Mixer'}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground text-sm">No mixers</span>
                          )}
                        </td>
                        <td className="p-3 text-right">{(item.price || 0).toFixed(2)} AED</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30">
                      <td colSpan="4" className="p-3 text-right font-medium">Total:</td>
                      <td className="p-3 text-right font-medium">{(order.totalAmount || 0).toFixed(2)} AED</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-muted-foreground">
                      No items in this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex gap-2">
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button 
                variant="success" 
                onClick={() => handleStatusChange("delivered")}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 mr-1" /> {isUpdating ? 'Processing...' : 'Mark Delivered'}
              </Button>
            )}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button 
                variant="destructive" 
                onClick={() => handleStatusChange("cancelled")}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" /> {isUpdating ? 'Processing...' : 'Cancel Order'}
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
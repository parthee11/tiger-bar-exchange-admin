/* eslint-disable max-lines-per-function */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { X, Check, Clock, AlertTriangle, MapPin, CreditCard } from 'lucide-react';
import branchesApi from '../api/branches';
import { useToast } from './ui/use-toast';
import { PaymentMethodModal } from './orders/PaymentMethodModal';

export function OrderDetails({ order, isOpen, onClose, onStatusChange, onCollectPayment }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [branchInfo, setBranchInfo] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ id: null, updateGroup: false });
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
          console.error('Error fetching branch info:', error);
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
      return format(new Date(dateString), 'PPpp'); // Format: Apr 29, 2023, 7:14 PM
    } catch {
      return dateString;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'closed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get payment badge variant
  const getPaymentVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'closed':
        return <Check className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <X className="h-4 w-4 mr-1" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
  };

  // Handle status change
  const handleStatusChange = async (targetId, newStatus, updateGroup = false) => {
    try {
      setIsUpdating(true);

      // Let the parent component handle the API call
      await onStatusChange(targetId, newStatus, updateGroup);

      // Show success toast
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${newStatus}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to update order status:', error);

      // Show error toast
      toast({
        title: 'Update Failed',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle collect payment (open modal)
  const handleCollectPayment = (targetId, updateGroup = false) => {
    setPaymentData({ id: targetId, updateGroup });
    setIsPaymentModalOpen(true);
  };

  const onSelectPaymentMethod = async (paymentMethod) => {
    try {
      setIsUpdating(true);
      const { id, updateGroup } = paymentData;

      // Let the parent component handle the API call
      await onCollectPayment(id, paymentMethod, updateGroup);

      // Show success toast
      toast({
        title: 'Payment Collected',
        description: `Order marked as paid via ${paymentMethod}`,
        variant: 'success',
      });
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Failed to collect payment:', error);

      // Show error toast
      toast({
        title: 'Update Failed',
        description: 'Failed to update payment status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate pending balance
  const calculatePendingBalance = () => {
    if (order && order.isGroup && order.allOrders) {
      return order.allOrders.reduce((acc, subOrder) => {
        if (subOrder.paymentStatus !== 'paid' && subOrder.status !== 'cancelled') {
          return acc + (subOrder.totalAmount || 0);
        }
        return acc;
      }, 0);
    }

    if (order && order.paymentStatus !== 'paid' && order.status !== 'cancelled') {
      return order.totalAmount || 0;
    }

    return 0;
  };

  const pendingBalance = calculatePendingBalance();

  const isTableOccupied = () => {
    if (!order || !branchInfo || !branchInfo.tables) return false;

    const table = branchInfo.tables.find((t) => String(t.tableNumber) === String(order.tableNumber));
    if (!table || table.status !== 'occupied') return false;

    // Get order user ID safely
    const orderUserId = typeof order.user === 'object' ? order.user._id : order.user;

    // Check if table is occupied AND if it was occupied by the user associated with this order
    const isOwner = !table.occupiedBy || String(table.occupiedBy) === String(orderUserId);

    return isOwner;
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
          <DialogTitle className="text-xl flex items-center gap-2">
            Order Details
            <Badge variant="secondary" className="text-sm font-mono px-1.5">
              #{order._id.substring(order._id.length - 6)}
            </Badge>
            {order.isGroup && order.orderIds && order.orderIds.length > 1 && (
              <Badge variant="outline" className="text-[10px]">
                Grouped ({order.orderIds.length} orders)
              </Badge>
            )}
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
                  {order.branch ? 'Branch information not available' : 'No branch assigned'}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Order Information</h3>
            <p>
              <span className="text-muted-foreground">Order Status:</span>
              {order.status === 'cancelled' ? (
                <Badge variant="destructive" className="ml-2 inline-flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  Cancelled
                </Badge>
              ) : order.status === 'closed' ? (
                <Badge variant="secondary" className="ml-2 inline-flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Closed
                </Badge>
              ) : isTableOccupied() ? (
                <Badge variant="outline" className="ml-2 inline-flex items-center bg-blue-50 text-blue-600 border-blue-200">
                  <Clock className="h-4 w-4 mr-1" />
                  Table Open
                </Badge>
              ) : (order.allPaid && order.allDelivered) ? (
                <Badge variant="secondary" className="ml-2 inline-flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Closed
                </Badge>
              ) : order.status ? (
                <Badge variant={getStatusVariant(order.status)} className="ml-2 inline-flex items-center">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              ) : (
                <span className="ml-2">Unknown</span>
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Payment Status:</span>
              {order.status === 'cancelled' ? (
                <Badge variant="secondary" className="ml-2">N/A</Badge>
              ) : (
                <Badge variant={order.allPaid ? 'success' : 'warning'} className="ml-2">
                  {order.allPaid ? 'Paid' : 'Pending'}
                </Badge>
              )}
            </p>
            {pendingBalance > 0 && (
              <p>
                <span className="text-muted-foreground font-medium">Pending Balance:</span>
                <span className="ml-2 text-destructive font-bold">{pendingBalance.toFixed(2)} AED</span>
              </p>
            )}
            <p><span className="text-muted-foreground">Total Amount:</span> {(order.totalAmount || 0).toFixed(2)} AED</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {order.isGroup && order.allOrders ? (
            order.allOrders.map((subOrder) => (
              <div key={subOrder._id} className="border rounded-md overflow-hidden">
                <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Order</h3>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        #{subOrder._id.substring(subOrder._id.length - 6)}
                      </Badge>
                      <Badge variant={getStatusVariant(subOrder.status)} className="text-[10px]">
                        {subOrder.status.charAt(0).toUpperCase() + subOrder.status.slice(1)}
                      </Badge>
                      {subOrder.status !== 'cancelled' && (
                        <Badge variant={getPaymentVariant(subOrder.paymentStatus)} className="text-[10px]">
                          {subOrder.paymentStatus ? subOrder.paymentStatus.charAt(0).toUpperCase() + subOrder.paymentStatus.slice(1) : 'Pending'}
                        </Badge>
                      )}
                    </div>
                  <span className="text-xs text-muted-foreground">{formatDate(subOrder.createdAt)}</span>
                </div>
                <div className="p-0">
                  <table className="w-full">
                    <thead className="bg-muted/20 text-xs">
                      <tr className="border-b">
                        <th className="p-2 text-left font-medium">Item</th>
                        <th className="p-2 text-left font-medium">Qty</th>
                        <th className="p-2 text-right font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {subOrder.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="border-b last:border-0">
                          <td className="p-2">
                            {item.item?.name?.replace(/"/g, '') || 'Unknown Item'}
                            {item.mixers?.length > 0 && (
                              <div className="text-[10px] text-muted-foreground ml-1">
                                {item.mixers.map((m) => `${m.name} x${m.quantity}`).join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2 text-right">{(item.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-2 bg-muted/10 flex justify-between items-center">
                  <span className="text-sm font-medium">Subtotal: {(subOrder.totalAmount || 0).toFixed(2)} AED</span>
                  <div className="flex gap-1">
                    {subOrder.status !== 'delivered' && subOrder.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="xs"
                        className="h-7 text-[10px] px-2 border-success text-success hover:bg-success hover:text-white"
                        onClick={() => handleStatusChange(subOrder._id, 'delivered')}
                        disabled={isUpdating}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    {subOrder.paymentStatus !== 'paid' && subOrder.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="xs"
                        className="h-7 text-[10px] px-2 border-primary text-primary hover:bg-primary hover:text-white"
                        onClick={() => handleCollectPayment(subOrder._id, false)}
                        disabled={isUpdating}
                      >
                        <CreditCard className="h-3 w-3 mr-1" /> Collect Payment
                      </Button>
                    )}
                    {subOrder.status !== 'delivered' && subOrder.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="xs"
                        className="h-7 text-[10px] px-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleStatusChange(subOrder._id, 'cancelled')}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
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
                          <tr key={index} className={index !== order.items.length - 1 ? 'border-b' : ''}>
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
          )}

          <div className="bg-muted/30 p-3 rounded-md space-y-2 border">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold text-lg">{(order.totalAmount || 0).toFixed(2)} AED</span>
            </div>
            {pendingBalance > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-muted-foreground/20">
                <span className="font-bold text-destructive">Pending Balance:</span>
                <span className="font-bold text-xl text-destructive">{pendingBalance.toFixed(2)} AED</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex gap-2">
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Button
                variant="success"
                onClick={() => handleStatusChange(order._id, 'delivered', order.isGroup)}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 mr-1" /> {isUpdating ? 'Processing...' : order.isGroup ? 'Mark All Delivered' : 'Mark Delivered'}
              </Button>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Button
                variant="destructive"
                onClick={() => handleStatusChange(order._id, 'cancelled', order.isGroup)}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" /> {isUpdating ? 'Processing...' : order.isGroup ? 'Cancel All' : 'Cancel Order'}
              </Button>
            )}
            {!order.allPaid && (
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => handleCollectPayment(order._id, order.isGroup)}
                disabled={isUpdating}
              >
                <CreditCard className="h-4 w-4 mr-1" /> {isUpdating ? 'Processing...' : order.isGroup ? 'Collect All Payments' : 'Collect Payment'}
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Close</Button>
        </DialogFooter>
      </DialogContent>

      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSelectMethod={onSelectPaymentMethod}
        isUpdating={isUpdating}
      />
    </Dialog>
  );
}

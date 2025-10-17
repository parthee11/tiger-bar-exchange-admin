/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  MapPin,
  MessageSquare,
  Package,
} from 'lucide-react';
import prebookingsApi from '../api/prebookings';
import { formatDate, formatTime } from '../utils/dateUtils';
import { useToast } from '../components/ui/use-toast';
import { StatusBadge } from '../components/reservations/status-badge';
import { ConfirmationModal } from '../components/ui/confirmation-modal';

// Component for reservation details info
const ReservationInfo = ({ prebooking, onConfirm, confirmLoading }) => {
  // Prefer `preorderItems` if available; fallback to `items`
  const items =
    Array.isArray(prebooking?.preorderItems) &&
    prebooking.preorderItems.length > 0
      ? prebooking.preorderItems
      : Array.isArray(prebooking?.items)
      ? prebooking.items
      : [];

  const hasPreorderItems = items.length > 0;

  // Format currency (AED - Dirhams)
  const formatCurrency = (amount) => new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          {hasPreorderItems
            ? "Preeboking Information"
            : "Reservation Information"}
        </CardTitle>
        <CardDescription>
          {hasPreorderItems
            ? "Details about the prebooking"
            : "Details about the table reservation"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Booking ID</h3>
            <span className="font-mono">{prebooking._id}</span>
          </div>

          {/* Hide Status when there are preorder items */}
          {!hasPreorderItems && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Status</h3>
              <StatusBadge status={prebooking.status} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {prebooking.scheduledFor
                    ? formatDate(prebooking.scheduledFor)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {prebooking.scheduledFor
                    ? formatTime(prebooking.scheduledFor)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Number of Guests
                </p>
                <p className="font-medium">
                  {prebooking.numberOfGuests || "N/A"}
                </p>
              </div>
            </div>

            {prebooking.tableNumber && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Table Number</p>
                  <p className="font-medium">{prebooking.tableNumber}</p>
                </div>
              </div>
            )}
          </div>

          {prebooking.specialRequests && (
            <div className="border-t pt-4">
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Special Requests
                  </p>
                  <p className="font-medium">{prebooking.specialRequests}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prebooked / Preorder Items */}
          {hasPreorderItems && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                Prebooked Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="text-left py-2 px-1">Item ID</th>
                      <th className="text-left py-2 px-1">Quantity</th>
                      <th className="text-right py-2 px-1">Price</th>
                      <th className="text-right py-2 px-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-1 font-mono text-sm">
                          {item.itemId || item.id || "—"}
                        </td>
                        <td className="py-2 px-1">{item.quantity}</td>
                        <td className="py-2 px-1 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-2 px-1 text-right font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-medium">
                      <td colSpan="3" className="py-2 px-1 text-right">
                        Total:
                      </td>
                      <td className="py-2 px-1 text-right">
                        {formatCurrency(
                          items.reduce((t, it) => t + it.price * it.quantity, 0)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Note: When this reservation is confirmed, the prices of these
                items will increase in the market.
              </p>
            </div>
          )}

          {/* Actions — hide when there are preorder items */}
          <div className="border-t pt-4 flex justify-end">
            {prebooking.status === "pending" && !hasPreorderItems && (
              <Button
                onClick={onConfirm}
                disabled={confirmLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {confirmLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirm Reservation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for customer information
const CustomerInfo = ({ prebooking }) => (
  <Card>
    <CardHeader>
      <CardTitle>Customer Information</CardTitle>
      <CardDescription>Details about the customer</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">
            {prebooking.user && prebooking.user.name
              ? prebooking.user.name
              : 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">
            {prebooking.user && prebooking.user.email
              ? prebooking.user.email
              : 'N/A'}
          </p>
        </div>

        {/* <div>
          <p className="text-sm text-muted-foreground">Branch</p>
          <p className="font-medium">
            {prebooking.branch && prebooking.branch.name
              ? prebooking.branch.name
              : 'N/A'}
          </p>
        </div> */}

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">Created At</p>
          <p className="font-medium">
            {prebooking.createdAt
              ? new Date(prebooking.createdAt).toLocaleString()
              : 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="font-medium">
            {prebooking.updatedAt
              ? new Date(prebooking.updatedAt).toLocaleString()
              : 'N/A'}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function PrebookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prebooking, setPrebooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Fetch prebooking details on component mount
  useEffect(() => {
    if (id) {
      fetchPrebookingDetails();
    }
  }, [id]);

  // Fetch prebooking details from API
  const fetchPrebookingDetails = async () => {
    setLoading(true);
    try {
      const response = await prebookingsApi.getPrebooking(id);
      if (response.success && response.data) {
        setPrebooking(response.data);
      } else {
        setError('Failed to load reservation details');
        toast({
          title: 'Error',
          description: 'Failed to load reservation details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      setError('Failed to load reservation details');
      toast({
        title: 'Error',
        description: 'Failed to load reservation details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const openConfirmModal = () => {
    setConfirmModalOpen(true);
  };

  // Handle prebooking confirmation
  const handleConfirmPrebooking = async () => {
    if (!id) return;

    setConfirmLoading(true);
    try {
      const response = await prebookingsApi.confirmPrebooking(id);
      if (response.success) {
        // Refresh the prebooking details
        fetchPrebookingDetails();
        toast({
          title: 'Success',
          description: 'Reservation confirmed successfully',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to confirm reservation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm reservation',
        variant: 'destructive',
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigate('/prebookings')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Reservation Details
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading reservation details...
          </span>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchPrebookingDetails}
          >
            Try Again
          </Button>
        </div>
      ) : prebooking ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Booking Info */}
          <ReservationInfo
            prebooking={prebooking}
            onConfirm={openConfirmModal}
            confirmLoading={confirmLoading}
          />

          {/* Customer Info */}
          <CustomerInfo prebooking={prebooking} />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No reservation found with ID: {id}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/prebookings')}
          >
            Back to Reservations
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmPrebooking}
        title="Confirm Reservation"
        message="Are you sure you want to confirm this reservation? This action cannot be undone."
        confirmText="Confirm"
        confirmVariant="success"
      />
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import prebookingsApi from "../api/prebookings";
import { useToast } from "../components/ui/use-toast";
import { FilterBar } from "../components/reservations/filter-bar";
import { ReservationTable } from "../components/reservations/reservation-table";
import { ConfirmationModal } from "../components/ui/confirmation-modal";

export function Prebookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prebookings, setPrebookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Fetch prebookings on component mount
  useEffect(() => {
    fetchPrebookings();
  }, []);

  // Fetch prebookings from API
  const fetchPrebookings = async () => {
    setLoading(true);
    try {
      const response = await prebookingsApi.getPrebookings();
      if (response.success && response.data) {
        setPrebookings(response.data);
      } else {
        setError('Failed to load reservations');
        toast({
          title: "Error",
          description: "Failed to load reservations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to load reservations');
      toast({
        title: "Error",
        description: "Failed to load reservations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const openConfirmModal = (id) => {
    setSelectedBookingId(id);
    setConfirmModalOpen(true);
  };

  // Handle prebooking confirmation
  const handleConfirmPrebooking = async () => {
    if (!selectedBookingId) return;
    
    try {
      const response = await prebookingsApi.confirmPrebooking(selectedBookingId);
      if (response.success) {
        // Refresh the prebookings list
        fetchPrebookings();
        toast({
          title: "Success",
          description: "Reservation confirmed successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to confirm reservation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast({
        title: "Error",
        description: "Failed to confirm reservation",
        variant: "destructive",
      });
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Navigate to prebooking detail page
  const handleViewPrebooking = (id) => {
    navigate(`/prebooking-detail/${id}`);
  };

  // Filter prebookings based on status
  const filteredPrebookings = filter === 'all' 
    ? prebookings 
    : prebookings.filter(booking => booking.status && booking.status.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
        <p className="text-muted-foreground">
          View and manage table reservations
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Upcoming Reservations</CardTitle>
            <CardDescription>
              Manage table reservations and special events
            </CardDescription>
          </div>
          <div className="ml-auto">
            <FilterBar 
              filter={filter} 
              onFilterChange={handleFilterChange} 
              onRefresh={fetchPrebookings} 
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading reservations...</span>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-800">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchPrebookings}>
                Try Again
              </Button>
            </div>
          ) : prebookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No reservations found</p>
            </div>
          ) : (
            <ReservationTable 
              reservations={filteredPrebookings} 
              onConfirm={openConfirmModal}
              onView={handleViewPrebooking}
            />
          )}
        </CardContent>
      </Card>

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
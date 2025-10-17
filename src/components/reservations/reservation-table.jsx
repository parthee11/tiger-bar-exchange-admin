/* eslint-disable complexity */
import React from 'react';
import { Button } from '../ui/button';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { StatusBadge } from './status-badge';

/**
 * ReservationTable component for displaying reservations
 *
 * @param {Object} props
 * @param {Array} props.reservations - List of reservations to display
 * @param {Function} props.onConfirm - Function to call when confirm button is clicked
 * @param {Function} props.onView - Function to call when view button is clicked
 * @param {Boolean} props.showPaymentStatus - Whether to show payment status column (for prebookings)
 * @returns {JSX.Element}
 */
export function ReservationTable({ reservations, onConfirm, onView, showPaymentStatus = false }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50 text-sm">
            <th className="p-3 text-left font-medium">Booking ID</th>
            <th className="p-3 text-left font-medium">Customer</th>
            {/* <th className="p-3 text-left font-medium">Branch</th> */}
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Time</th>
            <th className="p-3 text-left font-medium">Guests</th>
            {/* {showPaymentStatus && <th className="p-3 text-left font-medium">Status</th>} */}
            {showPaymentStatus && <th className="p-3 text-left font-medium">Payment Status</th>}
            <th className="p-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((booking, index) => (
            <tr key={booking._id || index} className="border-b">
              <td className="p-3 font-medium">
                {booking._id ? booking._id.substring(Math.max(0, booking._id.length - 8)) : 'N/A'}
              </td>
              <td className="p-3">
                {booking.user ? (booking.user.name || booking.user.email || 'Unknown') : (booking.customerName || 'Unknown')}
              </td>
              {/* <td className="p-3">
                {booking.branch ? (booking.branch.name || 'Unknown') : (booking.branchName || 'Unknown')}
              </td> */}
              <td className="p-3">{booking.scheduledFor ? formatDate(booking.scheduledFor) : 'N/A'}</td>
              <td className="p-3">{booking.scheduledFor ? formatTime(booking.scheduledFor) : 'N/A'}</td>
              <td className="p-3">{booking.numberOfGuests || 'N/A'}</td>
              {/* {showPaymentStatus && (
                <td className="p-3">
                  <StatusBadge status={booking.status} />
                </td>
              )} */}
              {showPaymentStatus && (
                <td className="p-3">
                  <StatusBadge status={booking.paymentStatus} />
                </td>
              )}
              <td className="p-3">
                <div className="flex gap-2">
                  {booking.status && booking.status.toLowerCase() === 'pending' && !showPaymentStatus ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => booking._id && onConfirm(booking._id)}
                      disabled={!booking._id}
                    >
                      Confirm
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => booking._id && onView(booking._id)}
                    disabled={!booking._id}
                  >
                    View
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

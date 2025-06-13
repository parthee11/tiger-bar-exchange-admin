import React from 'react';
import { CheckCircle, XCircle, Clock, Settings } from 'lucide-react';

// Constants
const statusColors = {
  available: '#4caf50', // Green
  occupied: '#f44336', // Red
  reserved: '#ff9800', // Orange
  maintenance: '#9e9e9e', // Gray
};

const statusIcons = {
  available: CheckCircle,
  occupied: XCircle,
  reserved: Clock,
  maintenance: Settings,
};

const StatusBadge = ({ status }) => {
  const color = statusColors[status] || '#9e9e9e';
  const StatusIcon = statusIcons[status] || Settings;

  return (
    <div
      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <StatusIcon className="h-3 w-3 mr-1" />
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default StatusBadge;
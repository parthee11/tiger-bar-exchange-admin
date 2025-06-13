/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date (e.g., "Jun 15, 2023")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format a time string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time (e.g., "7:00 PM")
 */
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date and time string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date and time (e.g., "Jun 15, 2023 at 7:00 PM")
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

/**
 * Check if a date is in the past
 * @param {string} dateString - ISO date string
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 0) {
    // Past
    if (diffSec > -60) return 'just now';
    if (diffMin > -60) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) === 1 ? '' : 's'} ago`;
    if (diffHour > -24) return `${Math.abs(diffHour)} hour${Math.abs(diffHour) === 1 ? '' : 's'} ago`;
    if (diffDay > -30) return `${Math.abs(diffDay)} day${Math.abs(diffDay) === 1 ? '' : 's'} ago`;
    return formatDate(dateString);
  } else {
    // Future
    if (diffSec < 60) return 'in a few seconds';
    if (diffMin < 60) return `in ${diffMin} minute${diffMin === 1 ? '' : 's'}`;
    if (diffHour < 24) return `in ${diffHour} hour${diffHour === 1 ? '' : 's'}`;
    if (diffDay < 30) return `in ${diffDay} day${diffDay === 1 ? '' : 's'}`;
    return formatDate(dateString);
  }
};
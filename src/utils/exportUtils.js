/**
 * Utility functions for exporting data
 */

/**
 * Convert array of objects to CSV string
 * 
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with title and key properties
 * @returns {string} CSV string
 */
export function convertToCSV(data, headers) {
  if (!data || !data.length || !headers || !headers.length) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(header => header.title).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Handle special cases like booleans, nulls, etc.
      const value = item[header.key];
      
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      
      // Escape quotes and wrap in quotes if the value contains commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
}

/**
 * Download data as a CSV file
 * 
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with title and key properties
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(data, headers, filename) {
  const csv = convertToCSV(data, headers);
  
  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add link to document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
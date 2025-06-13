import React from "react";
import { Button } from "./button";
import { X } from "lucide-react";

/**
 * A reusable confirmation modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Function} props.onConfirm - Function to call when the action is confirmed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {string} props.confirmVariant - Button variant for confirm button (default, destructive, outline, etc.)
 * @returns {JSX.Element}
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default"
}) {
  if (!isOpen) return null;

  const handleClose = (e) => {
    // Prevent event from bubbling up to parent elements
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white p-6 rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            className="rounded-full h-8 w-8 inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} type="button">
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            type="button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
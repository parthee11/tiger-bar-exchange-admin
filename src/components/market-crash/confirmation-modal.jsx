import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

/**
 * ConfirmationModal component for market crash actions
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Function} props.onConfirm - Function to call when the action is confirmed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {string} props.confirmVariant - Button variant for confirm button
 * @returns {JSX.Element|null} ConfirmationModal component or null if not open
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

  // Handle close with proper event handling
  const handleClose = (e) => {
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
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
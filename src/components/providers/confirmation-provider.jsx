import React, { createContext, useContext } from 'react';
import { useConfirmation } from '../../hooks/useConfirmation';
import { ConfirmationModal } from '../ui/confirmation-modal';

// Create a context for the confirmation dialog
const ConfirmationContext = createContext(null);

/**
 * A provider component for the confirmation dialog
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export function ConfirmationProvider({ children }) {
  const confirmation = useConfirmation();

  return (
    <ConfirmationContext.Provider value={confirmation}>
      {children}
      <ConfirmationModal
        isOpen={confirmation.isConfirmationOpen}
        onClose={confirmation.closeConfirmation}
        onConfirm={confirmation.confirm}
        title={confirmation.confirmationData.title}
        message={confirmation.confirmationData.message}
        confirmText={confirmation.confirmationData.confirmText}
        cancelText={confirmation.confirmationData.cancelText}
        confirmVariant={confirmation.confirmationData.confirmVariant}
      />
    </ConfirmationContext.Provider>
  );
}

/**
 * A hook for using the confirmation dialog
 * 
 * @returns {Object} - The confirmation state and functions
 */
export function useConfirmationDialog() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmationDialog must be used within a ConfirmationProvider');
  }
  return context;
}
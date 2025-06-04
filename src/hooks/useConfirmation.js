import { useState } from 'react';

/**
 * A custom hook for managing confirmation dialogs
 * 
 * @returns {Object} - The confirmation state and functions
 * @property {boolean} isConfirmationOpen - Whether the confirmation dialog is open
 * @property {Function} openConfirmation - Function to open the confirmation dialog
 * @property {Function} closeConfirmation - Function to close the confirmation dialog
 * @property {Function} confirm - Function to confirm the action
 * @property {Object} confirmationData - Data for the confirmation dialog
 */
export function useConfirmation() {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'default',
  });

  /**
   * Open the confirmation dialog
   * 
   * @param {Object} options - Options for the confirmation dialog
   * @param {string} options.title - Title of the confirmation dialog
   * @param {string} options.message - Message of the confirmation dialog
   * @param {Function} options.onConfirm - Function to call when the action is confirmed
   * @param {string} options.confirmText - Text for the confirm button
   * @param {string} options.cancelText - Text for the cancel button
   * @param {string} options.confirmVariant - Button variant for confirm button
   */
  const openConfirmation = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    onConfirm = () => {},
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'default',
  }) => {
    setConfirmationData({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      confirmVariant,
    });
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  const confirm = () => {
    confirmationData.onConfirm();
    closeConfirmation();
  };

  return {
    isConfirmationOpen,
    openConfirmation,
    closeConfirmation,
    confirm,
    confirmationData,
  };
}
import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

/**
 * Reusable confirmation dialog component
 * Used for actions that require user confirmation
 */
const ConfirmationDialog = ({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'primary' // 'primary', 'error', 'warning'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Determine button color based on severity
  const buttonColor = {
    primary: 'primary',
    error: 'error',
    warning: 'warning'
  }[severity] || 'primary';

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{cancelLabel}</Button>
        <Button 
          onClick={handleConfirm} 
          color={buttonColor} 
          variant="contained" 
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;

// src/components/ui/dialog.tsx
import { Dialog as ReachDialog, DialogContent as ReachDialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import React from 'react';

// Props interface for the Dialog component
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Main Dialog component
export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => (
  <ReachDialog isOpen={isOpen} onDismiss={onClose}>
    {children}
  </ReachDialog>
);

// Title component inside the Dialog
export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2>{children}</h2>
);

// Content component inside the Dialog
export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReachDialogContent>{children}</ReachDialogContent>
);


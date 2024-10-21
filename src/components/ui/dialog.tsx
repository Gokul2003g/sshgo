import { Dialog as ReachDialog, DialogContent as ReachDialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => (
  <ReachDialog isOpen={isOpen} onDismiss={onClose}>
    {children}
  </ReachDialog>
);

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2>{children}</h2>
);

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReachDialogContent>{children}</ReachDialogContent>
);





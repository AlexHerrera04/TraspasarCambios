import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from '@material-tailwind/react';

interface DeleteConfirmationModalProps {
  open: boolean;
  handleOpen: () => void;
  onConfirm: () => void;
  organizationName: string;
}

export function DeleteConfirmationModal({
  open,
  handleOpen,
  onConfirm,
  organizationName,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>Confirm Deletion</DialogHeader>
      <DialogBody divider>
        <Typography color="red" className="font-normal">
          Are you sure you want to delete the organization "{organizationName}"?
          This action cannot be undone.
        </Typography>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="blue-gray"
          onClick={handleOpen}
          className="mr-1"
        >
          Cancel
        </Button>
        <Button variant="gradient" color="red" onClick={onConfirm}>
          Confirm Delete
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

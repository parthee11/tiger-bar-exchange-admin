import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import SelectDropdown from './select-dropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';

// Status options for select dropdown
const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'Maintenance' },
];

export const AddTableDialog = ({ 
  open, 
  onClose, 
  onAdd, 
  tableNumber, 
  setTableNumber, 
  tableStatus, 
  setTableStatus, 
  error 
}) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Table</DialogTitle>
        <DialogDescription>
          Enter the details for the new table.
        </DialogDescription>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
      </DialogHeader>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label
              htmlFor="tableNumber"
              className="block text-sm font-medium mb-1"
            >
              Table Number<span className="text-red-500">*</span>
            </label>
            <Input
              id="tableNumber"
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g., T01"
              className="w-full"
              autoFocus
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <SelectDropdown
              id="status"
              label="Status"
              value={tableStatus}
              onChange={(e) => setTableStatus(e.target.value)}
              options={statusOptions}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onAdd}>Add Table</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const EditTableDialog = ({ 
  open, 
  onClose, 
  onUpdate, 
  selectedTable, 
  tableStatus, 
  setTableStatus, 
  error 
}) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Update Table Status</DialogTitle>
        <DialogDescription>
          Change the status of table {selectedTable?.tableNumber}.
        </DialogDescription>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
      </DialogHeader>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="py-4">
        <SelectDropdown
          id="edit-status"
          label="Status"
          value={tableStatus}
          onChange={(e) => setTableStatus(e.target.value)}
          options={statusOptions}
          className="w-full"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onUpdate}>Update Status</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const DeleteTableDialog = ({ 
  open, 
  onClose, 
  onDelete, 
  selectedTable, 
  error 
}) => {
  // Check if we have a valid table selected
  const isValidTable = selectedTable && selectedTable.tableNumber;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Table</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
        </DialogHeader>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="py-4">
          {isValidTable ? (
            <p>
              Are you sure you want to delete table <strong>{selectedTable.tableNumber}</strong>?
            </p>
          ) : (
            <p className="text-amber-600">
              Error: Unable to identify the table to delete. Please try again.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={!isValidTable}
            className="bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
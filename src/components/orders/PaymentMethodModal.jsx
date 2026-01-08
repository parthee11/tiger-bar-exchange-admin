import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Banknote, CreditCard, ShoppingBag, Gift, Briefcase } from 'lucide-react';

export function PaymentMethodModal({ isOpen, onClose, onSelectMethod, isUpdating }) {
  const methods = [
    { id: 'CASH', label: 'CASH', icon: <Banknote className="h-5 w-5 mr-2" />, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { id: 'CC', label: 'CC', icon: <CreditCard className="h-5 w-5 mr-2" />, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { id: 'ZOMATO PAY', label: 'ZOMATO PAY', icon: <ShoppingBag className="h-5 w-5 mr-2" />, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { id: 'MARKETING COMPLIMENTARY', label: 'MARKETING COMPLIMENTARY', icon: <Gift className="h-5 w-5 mr-2" />, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { id: 'MANAGEMENT COMPLIMENTARY', label: 'MANAGEMENT COMPLIMENTARY', icon: <Briefcase className="h-5 w-5 mr-2" />, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Choose the payment method used for this collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-4">
          {methods.map((method) => (
            <Button
              key={method.id}
              variant="outline"
              className={`justify-start h-12 text-sm font-medium ${method.color} border-none`}
              onClick={() => onSelectMethod(method.id)}
              disabled={isUpdating}
            >
              {method.icon}
              {method.label}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function LoyaltyPointsDialog({
  open,
  onOpenChange,
  user,
  amount,
  onAmountChange,
  reason,
  onReasonChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Loyalty Points</DialogTitle>
          <DialogDescription>
            {user ? `Update loyalty points for ${user.name}` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>
        {user && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Current Points:</Label>
              <div className="col-span-3 font-semibold">
                {user.loyaltyPoints}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Add Points
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                className="col-span-3"
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Input
                id="reason"
                type="text"
                placeholder="Admin adjustment"
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Update Points</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CouponDialog({ 
  open, 
  onOpenChange, 
  user, 
  onStatusChange = null,
  isUpdating = false 
}) {
  const [isUsed, setIsUsed] = React.useState(false);

  React.useEffect(() => {
    if (user?.signupReward) {
      setIsUsed(user.signupReward.used || false);
    }
  }, [user, open]);

  if (!user) return null;

  const signupReward = user.signupReward || {};
  const offerType = signupReward.offerType || 'N/A';
  const discountCode = signupReward.discountCode || 'N/A';

  const offerTypeLabel = {
    '2_free_pints': '2 Free Pints',
    '50_discount': '50% Discount',
    'free_premium_shisha': 'Free Premium Shisha',
    '4_shooters_free': '4 Free Shooters',
    '1_free_starter': '1 Free Starter',
    '1_free_dart_entry': '1 Free Dart Entry',
  };

  const handleSave = () => {
    if (onStatusChange) {
      onStatusChange({
        used: isUsed
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Coupon & Signup Reward</DialogTitle>
          <DialogDescription>
            Manage signup rewards and coupons for {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Offer Type:</Label>
            <div className="col-span-3">
              {offerTypeLabel[offerType] || offerType}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Claimed:</Label>
            <div className="col-span-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  signupReward.claimed
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {signupReward.claimed ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Used:</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Button
                variant={isUsed ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsUsed(!isUsed)}
                disabled={isUpdating}
                className="w-20"
              >
                {isUsed ? 'Yes' : 'No'}
              </Button>
              <span className="text-xs text-muted-foreground">Click to toggle</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Code:</Label>
            <div className="col-span-3 font-mono text-sm break-all">
              {discountCode}
            </div>
          </div>
          {signupReward.claimedAt && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Claimed At:</Label>
              <div className="col-span-3 text-sm">
                {new Date(signupReward.claimedAt).toLocaleDateString()}
              </div>
            </div>
          )}
          {signupReward.usedAt && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Used At:</Label>
              <div className="col-span-3 text-sm">
                {new Date(signupReward.usedAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !onStatusChange}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

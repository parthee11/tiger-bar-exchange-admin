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
  const [signupReward, setSignupReward] = React.useState(null);
  const [coupons, setCoupons] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      setSignupReward(user.signupReward || null);
      setCoupons(user.coupons || []);
    }
  }, [user, open]);

  if (!user) return null;

  const offerTypeLabel = {
    '2_free_pints': '2 Free Pints',
    '50_discount': '50% Discount',
    'free_premium_shisha': 'Free Premium Shisha',
    '4_shooters_free': '4 Free Shooters',
    '1_free_starter': '1 Free Starter',
    '1_free_dart_entry': '1 Free Dart Entry',
  };

  const handleToggleSignupReward = () => {
    if (!signupReward) return;
    setSignupReward({
      ...signupReward,
      used: !signupReward.used,
      usedAt: !signupReward.used ? new Date().toISOString() : null
    });
  };

  const handleToggleCoupon = (index) => {
    const newCoupons = [...coupons];
    newCoupons[index] = {
      ...newCoupons[index],
      used: !newCoupons[index].used,
      usedAt: !newCoupons[index].used ? new Date().toISOString() : null
    };
    setCoupons(newCoupons);
  };

  const handleSave = () => {
    if (onStatusChange) {
      onStatusChange({
        signupReward,
        coupons
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>User Coupons & Rewards</DialogTitle>
          <DialogDescription>
            Manage signup rewards and collected coupons for {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Signup Reward Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold border-b pb-2">Signup Reward</h3>
            {signupReward && signupReward.claimed ? (
              <div className="grid gap-3 p-3 border rounded-lg bg-slate-50">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Offer:</Label>
                  <div className="col-span-3 text-sm font-medium">
                    {offerTypeLabel[signupReward.offerType] || signupReward.offerType}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Code:</Label>
                  <div className="col-span-3 font-mono text-xs bg-white p-1 border rounded">
                    {signupReward.discountCode}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Status:</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Button
                      variant={signupReward.used ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleToggleSignupReward}
                      disabled={isUpdating}
                      className="h-7 px-3 text-xs"
                    >
                      {signupReward.used ? 'Used' : 'Unused'}
                    </Button>
                    <span className="text-[10px] text-muted-foreground">
                      {signupReward.usedAt ? `Used: ${new Date(signupReward.usedAt).toLocaleDateString()}` : 'Click to mark as used'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic px-2">No signup reward claimed yet.</p>
            )}
          </div>

          {/* Additional Coupons Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold border-b pb-2">Spin Wheel Coupons</h3>
            <div className="space-y-3">
              {coupons && coupons.length > 0 ? (
                coupons.map((coupon, index) => (
                  <div key={index} className="grid gap-3 p-3 border rounded-lg bg-slate-50">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Offer:</Label>
                      <div className="col-span-3 text-sm font-medium">
                        {offerTypeLabel[coupon.offerType] || coupon.offerType}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Code:</Label>
                      <div className="col-span-3 font-mono text-xs bg-white p-1 border rounded">
                        {coupon.discountCode}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Status:</Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Button
                          variant={coupon.used ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleCoupon(index)}
                          disabled={isUpdating}
                          className="h-7 px-3 text-xs"
                        >
                          {coupon.used ? 'Used' : 'Unused'}
                        </Button>
                        <span className="text-[10px] text-muted-foreground">
                          {coupon.usedAt ? `Used: ${new Date(coupon.usedAt).toLocaleDateString()}` : 'Click to mark as used'}
                        </span>
                      </div>
                    </div>
                  </div>
                )).reverse()
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">No additional coupons found.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel } from "lucide-react";

interface BidInputProps {
  currentBid: number;
  minIncrement: number;
  currency: string;
  onPlaceBid: (amount: number) => void;
}

const BidInput = ({ currentBid, minIncrement, currency, onPlaceBid }: BidInputProps) => {
  const minBid = currentBid + minIncrement;
  const [bidAmount, setBidAmount] = useState(minBid.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (amount >= minBid) {
      onPlaceBid(amount);
    }
  };

  const quickBids = [
    minBid,
    minBid + minIncrement,
    minBid + minIncrement * 2,
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Current bid</p>
          <p className="text-2xl font-bold font-serif text-foreground">
            {currentBid.toLocaleString()} {currency}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Min. increment</p>
          <p className="text-sm font-medium text-foreground">
            +{minIncrement.toLocaleString()} {currency}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={minBid}
              step={minIncrement}
              className="text-lg pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency}
            </span>
          </div>
          <Button type="submit" variant="bid" size="lg" className="gap-2">
            <Gavel className="h-5 w-5" />
            Place Bid
          </Button>
        </div>

        <div className="flex gap-2">
          {quickBids.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBidAmount(amount.toString())}
              className="flex-1"
            >
              {amount.toLocaleString()} {currency}
            </Button>
          ))}
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        By placing a bid, you agree to our terms of service
      </p>
    </div>
  );
};

export default BidInput;

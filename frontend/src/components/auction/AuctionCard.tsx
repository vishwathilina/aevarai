import { Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuctionItem {
  id: string;
  title: string;
  image: string;
  category: string;
  currentBid: number;
  currency: string;
  timeRemaining: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
}

interface AuctionCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  auction: AuctionItem;
}

const AuctionCard = ({ auction, className, ...props }: AuctionCardProps) => {
  return (
    <Link 
      to={`/auction/${auction.id}`}
      className={cn("auction-card group block", className)}
      {...props}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={(e) => {
            e.preventDefault();
            // Handle favorite
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        {auction.isFeatured && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{auction.category}</p>
        <h3 className="font-medium text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {auction.title}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current bid</p>
            <p className="font-semibold text-foreground">
              {auction.currentBid.toLocaleString()} {auction.currency}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Closes in</p>
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              auction.isUrgent && "text-destructive"
            )}>
              <Clock className="h-3 w-3" />
              {auction.timeRemaining}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;

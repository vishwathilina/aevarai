import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Share2, Eye, ChevronLeft, ChevronRight, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BidInput from "@/components/auction/BidInput";
import CountdownTimer from "@/components/auction/CountdownTimer";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsApi } from "@/api/auctions";
import { bidsApi } from "@/api/bids";
import { productsApi } from "@/api/products";
import { useAuth } from "@/contexts/AuthContext";

const AuctionDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [proxyAmount, setProxyAmount] = useState<string>("");
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch auction details
  const { data: auction, isLoading, isError } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionsApi.getById(Number(id)),
    enabled: !!id,
  });

  // Fetch product details (for description) + product images
  const { data: product } = useQuery({
    queryKey: ['product', auction?.productId],
    queryFn: () => productsApi.getById(Number(auction?.productId)),
    enabled: !!auction?.productId,
  });

  const { data: productImages = [] } = useQuery({
    queryKey: ['product', auction?.productId, 'images'],
    queryFn: () => productsApi.getProductImages(Number(auction?.productId)),
    enabled: !!auction?.productId,
  });

  // Fetch bid history
  const { data: bidHistory = [] } = useQuery({
    queryKey: ['bids', 'auction', id],
    queryFn: () => bidsApi.getAuctionBids(Number(id)),
    enabled: !!id,
  });

  // Derive images list from productImages (must be before any conditional returns)
  const images = useMemo(() => {
    const urls = productImages
      .map((img: any) => img.imageUrl)
      .filter(Boolean);
    return urls.length > 0
      ? urls
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"];
  }, [productImages]);

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: (amount: number) =>
      bidsApi.placeBid({
        auctionId: Number(id),
        bidAmount: amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'auction', id] });
      toast.success("Bid placed successfully!", {
        description: "You're now the highest bidder.",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place bid");
    },
  });

  const handlePlaceBid = (amount: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to place a bid");
      return;
    }
    placeBidMutation.mutate(amount);
  };

  // Proxy bid mutation
  const proxyBidMutation = useMutation({
    mutationFn: (maxAmount: number) =>
      bidsApi.placeProxyBid({
        auctionId: Number(id),
        maxAmount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'auction', id] });
      toast.success("Proxy bid set successfully", {
        description: "We will auto-bid for you up to your max amount.",
      });
      setProxyAmount("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to set proxy bid");
    },
  });

  const handleSetProxyBid = () => {
    if (!isAuthenticated) {
      toast.error("Please login to set a proxy bid");
      return;
    }
    const value = parseFloat(proxyAmount);
    if (Number.isNaN(value) || value <= 0) {
      toast.error("Please enter a valid proxy amount");
      return;
    }
    proxyBidMutation.mutate(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading auction...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !auction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-2">Auction not found</p>
            <Button asChild>
              <Link to="/auctions">Browse Auctions</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const safeSelectedImage = Math.min(selectedImage, Math.max(0, images.length - 1));

  const currency = "Rs";
  const watcherCount = 0;
  const seller = { name: "Seller", rating: 4.9, reviews: 0, verified: true };

  const auctionTitle = auction.productTitle || `Auction #${auction.auctionId}`;
  const auctionCategory = auction.productCategory || "General";
  const auctionDescription = product?.description || "";

  const bidCount = bidHistory.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/auctions" className="hover:text-foreground">Auctions</Link>
            <span>/</span>
            <Link to={`/category/${auctionCategory.toLowerCase()}`} className="hover:text-foreground">
              {auctionCategory}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{auctionTitle}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
            {/* Left column - Images & Details */}
            <div className="space-y-8">
              {/* Image gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={images[safeSelectedImage]}
                    alt={auctionTitle}
                    className="w-full h-full object-cover"
                  />

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & actions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {auctionCategory}
                  </Badge>
                  <h1 className="font-serif text-2xl md:text-3xl font-semibold">
                    {auctionTitle}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {watcherCount} watching
                </span>
                <span>{bidCount} bids</span>
              </div>

              {/* Description */}
              <div className="prose prose-neutral max-w-none">
                <h2 className="font-serif text-xl font-semibold mb-4">Description</h2>
                <div className="whitespace-pre-wrap text-muted-foreground">
                  {auctionDescription || "No description available."}
                </div>
              </div>

              {/* Bid History */}
              <div>
                <h2 className="font-serif text-xl font-semibold mb-4">Bid History</h2>
                <div className="border rounded-lg divide-y">
                  {bidHistory.map((bid: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{bid.bidderName || "Bidder"}</p>
                        <p className="text-sm text-muted-foreground">
                          {bid.createdAt ? new Date(bid.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {Number(bid.bidAmount).toLocaleString()} {currency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Bidding */}
            <div className="lg:sticky lg:top-32 space-y-6 h-fit">
              {/* Timer */}
              <CountdownTimer endTime={new Date(auction.endTime)} />

              {/* Bid input */}
              <BidInput
                currentBid={auction.currentPrice ?? auction.startPrice}
                minIncrement={auction.minIncrement}
                currency={currency}
                onPlaceBid={handlePlaceBid}
              />

              {/* Proxy bid */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">Set proxy bid</p>
                  <p className="text-xs text-muted-foreground">
                    We'll auto-bid up to your max amount.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={proxyAmount}
                      onChange={(e) => setProxyAmount(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Enter max amount"
                      min={(auction.currentPrice ?? auction.startPrice) + auction.minIncrement}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {currency}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSetProxyBid}
                    disabled={proxyBidMutation.isLoading}
                  >
                    {proxyBidMutation.isLoading ? "Saving..." : "Set proxy"}
                  </Button>
                </div>
              </div>

              {/* Seller info */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-semibold text-lg">
                      {seller.name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{seller.name}</span>
                      {seller.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ★ {seller.rating} · {seller.reviews} reviews
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View seller profile
                </Button>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Buyer Protection</p>
                  <p className="text-muted-foreground">Full refund if item doesn't match description</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuctionDetail;

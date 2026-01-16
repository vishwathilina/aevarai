import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/auction/AuctionCard";
import type { AuctionItem } from "@/components/auction/AuctionCard";
import { categories } from "@/data/mockData";
import { auctionsApi } from "@/api/auctions";
import { Button } from "@/components/ui/button";

const Category = () => {
  const { categoryId } = useParams();

  const category = categories.find(
    (c) => c.id === categoryId
  );

  // Fetch live auctions from backend
  const { data: backendAuctions = [] } = useQuery({
    queryKey: ["auctions", "live", "category", categoryId],
    queryFn: auctionsApi.getLive,
  });

  // Map backend auction model to frontend AuctionItem
  const mapAuctionToItem = (auction: any): AuctionItem => {
    const endTime = new Date(auction.endTime);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeRemaining = "";
    if (days > 0) timeRemaining = `${days}d ${hours}h`;
    else if (hours > 0) timeRemaining = `${hours}h ${minutes}m`;
    else if (minutes > 0) timeRemaining = `${minutes}m`;
    else timeRemaining = "Ending soon";

    return {
      id: (auction.auctionId ?? auction.id).toString(),
      title: auction.productTitle || `Auction #${auction.auctionId ?? auction.id}`,
      image:
        auction.imageUrl ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      category: auction.productCategory || "General",
      currentBid: auction.currentPrice || auction.startPrice,
      currency: "Rs",
      timeRemaining,
      isUrgent: hours < 2 && days === 0,
      isFeatured: false,
    };
  };

  const allAuctions = backendAuctions.map(mapAuctionToItem);
  
  const categoryAuctions = allAuctions.filter((auction) => {
    const auctionCategoryId = auction.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    return auctionCategoryId === categoryId || auction.category.toLowerCase() === categoryId;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/categories" className="hover:text-foreground">Categories</Link>
            <span>/</span>
            <span className="text-foreground">{category?.name || categoryId}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2">
              {category?.name || categoryId}
            </h1>
            <p className="text-muted-foreground">
              {categoryAuctions.length > 0
                ? `${categoryAuctions.length} auctions in this category`
                : "Explore items in this category"}
            </p>
          </div>

          {/* Grid */}
          {categoryAuctions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryAuctions.map((auction, i) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <h2 className="font-serif text-xl font-semibold mb-2">No auctions yet</h2>
              <p className="text-muted-foreground mb-4">
                Be the first to list an item in this category!
              </p>
              <Link to="/sell">
                <Button>List an item</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Category;

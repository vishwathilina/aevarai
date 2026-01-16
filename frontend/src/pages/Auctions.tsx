import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/auction/AuctionCard";
import { categories } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { auctionsApi } from "@/api/auctions";
import type { AuctionItem } from "@/components/auction/AuctionCard";

// Helper to convert backend Auction to frontend AuctionItem format
const mapAuctionToItem = (auction: any): AuctionItem => {
  const endTime = new Date(auction.endTime);
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  // Calculate time remaining
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

const Auctions = () => {
  const [sortBy, setSortBy] = useState("ending-soon");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch live auctions from backend
  const { data: backendAuctions = [], isLoading, isError } = useQuery({
    queryKey: ['auctions', 'live'],
    queryFn: auctionsApi.getLive,
  });

  // Map backend auctions to frontend format
  const liveAuctions = backendAuctions.map(mapAuctionToItem);

  const filteredAuctions = liveAuctions.filter((auction) => {
    if (selectedCategories.length > 0) {
      const categoryId = auction.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
      if (!selectedCategories.includes(categoryId)) return false;
    }
    if (searchQuery) {
      return auction.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case "ending-soon":
        return a.timeRemaining.localeCompare(b.timeRemaining);
      case "highest-bid":
        return b.currentBid - a.currentBid;
      case "lowest-bid":
        return a.currentBid - b.currentBid;
      default:
        return 0;
    }
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span className="text-sm">{cat.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">({cat.count})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex gap-2">
          <Input placeholder="Min" type="number" className="flex-1" />
          <Input placeholder="Max" type="number" className="flex-1" />
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setSelectedCategories([])}
        >
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2">
              Live Auctions
            </h1>
            <p className="text-muted-foreground">
              {sortedAuctions.length} auctions available
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="highest-bid">Highest Bid</SelectItem>
                  <SelectItem value="lowest-bid">Lowest Bid</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {selectedCategories.length > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 rounded-full">
                        {selectedCategories.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active filters */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                return (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {cat?.name}
                    <button onClick={() => toggleCategory(catId)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar filters - desktop */}
            <aside className="hidden md:block">
              <div className="sticky top-32">
                <FilterContent />
              </div>
            </aside>

            {/* Auction grid */}
            <div>
              {isLoading ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Loading auctions...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <p className="text-destructive mb-2">Failed to load auctions</p>
                  <p className="text-sm text-muted-foreground">Please try again later</p>
                </div>
              ) : sortedAuctions.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedAuctions.map((auction, i) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No auctions found matching your criteria.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSearchQuery("");
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auctions;

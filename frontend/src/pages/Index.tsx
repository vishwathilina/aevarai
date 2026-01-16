import { ArrowRight, Shield, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/auction/AuctionCard";
import type { AuctionItem } from "@/components/auction/AuctionCard";
import CategoryCard from "@/components/auction/CategoryCard";
import { auctionsApi } from "@/api/auctions";
import { categories } from "@/data/mockData";

const Index = () => {
  // Fetch live auctions from backend to use as featured content
  const { data: backendAuctions = [] } = useQuery({
    queryKey: ["auctions", "live", "home"],
    queryFn: auctionsApi.getLive,
  });

  // Map backend auction model to frontend AuctionItem used by cards
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

  const liveAuctions: AuctionItem[] = backendAuctions.map(mapAuctionToItem);
  const displayAuctions = liveAuctions;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
                  Bidding.
                  <br />
                  <span className="italic">Safely.</span>
                  <br />
                  Effectively.
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  Sell and buy items, no worries. No minimal price. The best auction site from $1.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/sell">
                    <Button size="lg">Add auction</Button>
                  </Link>
                  <Link to="/auctions">
                    <Button variant="hero" size="lg">
                      Browse auctions
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Featured auction preview */}
              <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="absolute -top-4 right-0 text-sm italic text-muted-foreground font-serif">
                  Recommended for you →
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {displayAuctions.slice(0, 2).map((auction, i) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.3 + i * 0.1}s` } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="border-y border-border bg-background">
          <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Transactions</h3>
                  <p className="text-sm text-muted-foreground">Protected payments & buyer guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Bidding</h3>
                  <p className="text-sm text-muted-foreground">Live updates with anti-sniping protection</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Verified Sellers</h3>
                  <p className="text-sm text-muted-foreground">Trusted community of collectors</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container">
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-semibold">Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category, i) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Auctions */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-semibold">Featured Auctions</h2>
              <p className="text-muted-foreground mt-1">Handpicked items ending soon</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAuctions.slice(0, 6).map((auction, i) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="bg-foreground text-background rounded-2xl p-12 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
                Ready to start selling?
              </h2>
              <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
                Join thousands of sellers and reach collectors worldwide
              </p>
              <Link to="/sell">
                <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90">
                  List your first item
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

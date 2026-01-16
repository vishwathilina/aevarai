import { Link } from "react-router-dom";
import { Clock, ArrowUpRight, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const mockBids = {
  active: [
    {
      id: "1",
      auctionId: "3",
      title: "Rolex Submariner Date - 1985 Vintage",
      image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=200&q=80",
      myBid: 12500,
      currentBid: 12500,
      isHighest: true,
      timeRemaining: "1d 6h",
      currency: "Rs",
    },
    {
      id: "2",
      auctionId: "4",
      title: "First Edition - The Great Gatsby 1925",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
      myBid: 8200,
      currentBid: 8450,
      isHighest: false,
      timeRemaining: "3d 8h",
      currency: "Rs",
    },
  ],
  won: [
    {
      id: "3",
      auctionId: "10",
      title: "Antique Victorian Writing Desk",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
      winningBid: 3200,
      currency: "Rs",
      wonDate: "Dec 28, 2024",
      status: "pending_payment",
    },
  ],
  lost: [
    {
      id: "4",
      auctionId: "11",
      title: "1960s Fender Stratocaster",
      image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=200&q=80",
      myBid: 4500,
      winningBid: 5200,
      currency: "Rs",
      endDate: "Dec 20, 2024",
    },
  ],
};

const MyBids = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold mb-2">My Bids</h1>
            <p className="text-muted-foreground">Track all your bidding activity</p>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                Active
                <Badge variant="secondary" className="ml-1">{mockBids.active.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="won" className="gap-2">
                Won
                <Badge variant="secondary" className="ml-1">{mockBids.won.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {mockBids.active.map((bid) => (
                <div key={bid.id} className="bg-card rounded-xl border p-4 md:p-6">
                  <div className="flex gap-4 md:gap-6">
                    <Link to={`/auction/${bid.auctionId}`}>
                      <img
                        src={bid.image}
                        alt={bid.title}
                        className="w-20 h-20 md:w-28 md:h-28 rounded-lg object-cover"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link 
                            to={`/auction/${bid.auctionId}`}
                            className="font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {bid.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{bid.timeRemaining} left</span>
                          </div>
                        </div>
                        
                        {bid.isHighest ? (
                          <Badge className="bg-bid-success text-background shrink-0">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Highest Bidder
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Outbid
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground">Your bid</p>
                            <p className="font-semibold">{bid.myBid.toLocaleString()} {bid.currency}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current bid</p>
                            <p className="font-semibold">{bid.currentBid.toLocaleString()} {bid.currency}</p>
                          </div>
                        </div>

                        <Link to={`/auction/${bid.auctionId}`}>
                          <Button variant={bid.isHighest ? "outline" : "default"} size="sm">
                            {bid.isHighest ? "View Auction" : "Bid Again"}
                            <ArrowUpRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {mockBids.active.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border">
                  <p className="text-muted-foreground mb-4">You don't have any active bids</p>
                  <Link to="/auctions">
                    <Button>Browse Auctions</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="won" className="space-y-4">
              {mockBids.won.map((item) => (
                <div key={item.id} className="bg-card rounded-xl border p-4 md:p-6">
                  <div className="flex gap-4 md:gap-6">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 md:w-28 md:h-28 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium line-clamp-2">{item.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">Won on {item.wonDate}</p>
                        </div>
                        <Badge variant="outline">Pending Payment</Badge>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Winning bid</p>
                          <p className="font-semibold text-lg">{item.winningBid.toLocaleString()} {item.currency}</p>
                        </div>

                        <Link to={`/checkout/${item.auctionId}`}>
                          <Button size="sm">
                            Complete Purchase
                            <ArrowUpRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="lost" className="space-y-4">
              {mockBids.lost.map((item) => (
                <div key={item.id} className="bg-card rounded-xl border p-4 md:p-6 opacity-75">
                  <div className="flex gap-4 md:gap-6">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 md:w-28 md:h-28 rounded-lg object-cover grayscale"
                    />
                    
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">Ended {item.endDate}</p>

                      <div className="grid grid-cols-2 gap-6 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Your bid</p>
                          <p className="font-medium">{item.myBid.toLocaleString()} {item.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Winning bid</p>
                          <p className="font-medium">{item.winningBid.toLocaleString()} {item.currency}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBids;

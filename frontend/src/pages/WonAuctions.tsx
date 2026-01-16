import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsApi } from "@/api/auctions";
import { paymentsApi } from "@/api/payments";
import { deliveriesApi } from "@/api/deliveries";
import { toast } from "sonner";

interface WonAuctionWithDetails {
    auction: any;
    payment: any;
    delivery: any;
    status: string;
}

const statusConfig = {
    pending_payment: {
        label: "Pending Payment",
        icon: CreditCard,
        color: "bg-bid-warning text-background",
    },
    processing: {
        label: "Processing",
        icon: Package,
        color: "bg-muted text-muted-foreground",
    },
    shipped: {
        label: "Shipped",
        icon: Truck,
        color: "bg-primary text-primary-foreground",
    },
    delivered: {
        label: "Delivered",
        icon: CheckCircle2,
        color: "bg-bid-success text-background",
    },
};

const WonAuctions = () => {
    const { user, isAuthenticated } = useAuth();
    const [wonAuctions, setWonAuctions] = useState<WonAuctionWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch won auctions
    const { data: auctions = [] } = useQuery({
        queryKey: ['auctions', 'won', user?.id],
        queryFn: () => user?.id ? auctionsApi.getWonAuctions(user.id) : Promise.resolve([]),
        enabled: !!user?.id && isAuthenticated,
    });

    useEffect(() => {
        const loadWonAuctionsDetails = async () => {
            if (!auctions.length || !user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const details = await Promise.all(
                    auctions.map(async (auction) => {
                        // Fetch payment status
                        let payment = null;
                        try {
                            payment = await paymentsApi.getByAuction(auction.auctionId);
                        } catch (error) {
                            // Payment not found yet
                        }

                        // Fetch delivery status
                        let delivery = null;
                        try {
                            delivery = await deliveriesApi.getByAuction(auction.auctionId);
                        } catch (error) {
                            // Delivery not created yet
                        }

                        // Determine status
                        let status = "pending_payment";
                        if (payment?.status === "SUCCESS") {
                            if (delivery?.status === "COMPLETED") {
                                status = "delivered";
                            } else if (delivery?.status === "PENDING") {
                                status = "shipped";
                            } else {
                                status = "processing";
                            }
                        }

                        return {
                            auction,
                            payment,
                            delivery,
                            status,
                        };
                    })
                );

                setWonAuctions(details);
            } catch (error: any) {
                console.error("Error loading won auctions:", error);
                toast.error("Failed to load won auctions");
            } finally {
                setIsLoading(false);
            }
        };

        loadWonAuctionsDetails();
    }, [auctions, user?.id]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 bg-muted/30 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold mb-2">Please login to view your won auctions</h1>
                        <Link to="/login">
                            <Button>Login</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 bg-muted/30 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </main>
                <Footer />
            </div>
        );
    }

    const pendingPaymentCount = wonAuctions.filter(a => a.status === "pending_payment").length;
    const shippedCount = wonAuctions.filter(a => a.status === "shipped").length;
    const deliveredCount = wonAuctions.filter(a => a.status === "delivered").length;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-serif text-3xl font-semibold mb-2">Won Auctions</h1>
                        <p className="text-muted-foreground">Manage your winning purchases and track deliveries</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-card rounded-xl border p-4">
                            <p className="text-2xl font-bold font-serif">{wonAuctions.length}</p>
                            <p className="text-sm text-muted-foreground">Total Won</p>
                        </div>
                        <div className="bg-card rounded-xl border p-4">
                            <p className="text-2xl font-bold font-serif">{pendingPaymentCount}</p>
                            <p className="text-sm text-muted-foreground">Pending Payment</p>
                        </div>
                        <div className="bg-card rounded-xl border p-4">
                            <p className="text-2xl font-bold font-serif">{shippedCount}</p>
                            <p className="text-sm text-muted-foreground">In Transit</p>
                        </div>
                        <div className="bg-card rounded-xl border p-4">
                            <p className="text-2xl font-bold font-serif">{deliveredCount}</p>
                            <p className="text-sm text-muted-foreground">Delivered</p>
                        </div>
                    </div>

                    {/* Auction List */}
                    {wonAuctions.length === 0 ? (
                        <div className="bg-card rounded-xl border p-8 text-center">
                            <p className="text-muted-foreground">You haven't won any auctions yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wonAuctions.map((item) => {
                                const status = statusConfig[item.status as keyof typeof statusConfig];
                                const StatusIcon = status.icon;
                                const auction = item.auction;
                                const imageUrl = auction.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                                const winningBid = auction.currentPrice || auction.startPrice;
                                const wonDate = new Date(auction.endTime).toLocaleDateString();

                                return (
                                    <div key={auction.auctionId} className="bg-card rounded-xl border p-4 md:p-6">
                                        <div className="flex gap-4 md:gap-6">
                                            <img
                                                src={imageUrl}
                                                alt={auction.productTitle || "Auction item"}
                                                className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-medium line-clamp-2">
                                                            {auction.productTitle || `Auction #${auction.auctionId}`}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Won on {wonDate}
                                                        </p>
                                                    </div>

                                                    <Badge className={status.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {status.label}
                                                    </Badge>
                                                </div>

                                                <div className="mt-4">
                                                    <p className="text-sm text-muted-foreground">Winning bid</p>
                                                    <p className="font-semibold text-lg">
                                                        Rs. {winningBid.toLocaleString()}
                                                    </p>
                                                </div>

                                                {item.delivery?.deliveryType && (
                                                    <div className="mt-3 p-3 bg-muted rounded-lg">
                                                        <p className="text-sm text-muted-foreground">Delivery Type</p>
                                                        <p className="font-medium text-sm">
                                                            {item.delivery.deliveryType}
                                                            {item.delivery.deliveryFee > 0 && ` - Rs. ${item.delivery.deliveryFee.toFixed(2)}`}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 mt-4">
                                                    {item.status === "pending_payment" ? (
                                                        <Link to={`/checkout/${auction.auctionId}`}>
                                                            <Button size="sm">Complete Payment</Button>
                                                        </Link>
                                                    ) : item.status === "delivered" ? (
                                                        <Button variant="outline" size="sm">Leave Review</Button>
                                                    ) : (
                                                        <Button variant="outline" size="sm">Track Package</Button>
                                                    )}
                                                    <Button variant="ghost" size="sm">Contact Seller</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default WonAuctions;

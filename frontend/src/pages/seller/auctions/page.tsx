import { Link, useNavigate } from "react-router-dom";
import { Gavel, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Eye, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { sellerApi } from "@/api/seller";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const auctionStatusConfig = {
    SCHEDULED: { label: "Upcoming", icon: Clock, color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    LIVE: { label: "Live", icon: TrendingUp, color: "bg-green-500/20 text-green-600 border-green-500/30" },
    ENDED: { label: "Ended", icon: CheckCircle2, color: "bg-gray-500/20 text-gray-600 border-gray-500/30" },
    CANCELLED: { label: "Cancelled", icon: XCircle, color: "bg-red-500/20 text-red-600 border-red-500/30" },
    NO_BIDS: { label: "No Bids", icon: AlertCircle, color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
};

const SellerAuctions = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'AUCTIONEER') {
            navigate('/access-denied');
        }
    }, [isAuthenticated, user, navigate, authLoading]);

    const { data: auctions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['seller-auctions'],
        queryFn: sellerApi.getAuctions,
        refetchInterval: 15000, // Refetch every 15 seconds for live auction updates
        refetchOnWindowFocus: true,
        enabled: isAuthenticated && user?.role === 'AUCTIONEER',
    });

    const filteredAuctions = filter === "ALL"
        ? auctions
        : auctions.filter(a => a.status === filter);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleRefresh = () => {
        refetch();
        toast.success('Auctions refreshed');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 bg-muted/30 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading auctions...</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-muted/30">
                <div className="container py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link to="/seller/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="font-serif text-2xl font-semibold">My Auctions</h1>
                                <p className="text-sm text-muted-foreground">{auctions.length} auctions</p>
                            </div>
                        </div>
                        <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {["ALL", "SCHEDULED", "LIVE", "ENDED", "CANCELLED", "NO_BIDS"].map((status) => (
                            <Button
                                key={status}
                                variant={filter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status === "ALL" ? "All" : auctionStatusConfig[status as keyof typeof auctionStatusConfig]?.label || status}
                                {status !== "ALL" && (
                                    <span className="ml-2 text-xs opacity-70">
                                        ({auctions.filter(a => a.status === status).length})
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Failed to load auctions
                            <Button size="sm" variant="outline" onClick={handleRefresh} className="ml-auto">
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Auctions Table */}
                    <div className="bg-card rounded-xl border overflow-hidden">
                        {filteredAuctions.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No auctions found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-medium">Product</th>
                                            <th className="text-left p-4 font-medium">Start Time</th>
                                            <th className="text-left p-4 font-medium">End Time</th>
                                            <th className="text-right p-4 font-medium">Start Price</th>
                                            <th className="text-right p-4 font-medium">Current Bid</th>
                                            <th className="text-center p-4 font-medium">Bids</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-right p-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredAuctions.map((auction) => {
                                            const statusKey = auction.status as keyof typeof auctionStatusConfig;
                                            const status = auctionStatusConfig[statusKey] || auctionStatusConfig.SCHEDULED;
                                            const StatusIcon = status.icon;

                                            return (
                                                <tr key={auction.auctionId} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-medium">{auction.productTitle}</p>
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground">
                                                        {formatDateTime(auction.startTime)}
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground">
                                                        {formatDateTime(auction.endTime)}
                                                    </td>
                                                    <td className="p-4 text-right font-medium">
                                                        Rs. {auction.startPrice?.toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className={auction.currentPrice && auction.currentPrice > auction.startPrice ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                                                            Rs. {auction.currentPrice?.toLocaleString() || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-muted px-2 py-1 rounded text-sm">
                                                            {auction.totalBids}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className={status.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link to={`/auction/${auction.auctionId}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SellerAuctions;

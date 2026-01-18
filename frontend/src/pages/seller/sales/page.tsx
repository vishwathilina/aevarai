import { Link, useNavigate } from "react-router-dom";
import { DollarSign, CheckCircle2, Clock, AlertCircle, ArrowLeft, Eye, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { sellerApi } from "@/api/seller";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const paymentStatusConfig = {
    SUCCESS: { label: "Paid", icon: CheckCircle2, color: "bg-green-500/20 text-green-600 border-green-500/30" },
    PENDING: { label: "Pending", icon: Clock, color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
    FAILED: { label: "Failed", icon: AlertCircle, color: "bg-red-500/20 text-red-600 border-red-500/30" },
};

const SellerSales = () => {
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

    const { data: sales = [], isLoading, error, refetch } = useQuery({
        queryKey: ['seller-sales'],
        queryFn: sellerApi.getSales,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
        enabled: isAuthenticated && user?.role === 'AUCTIONEER',
    });

    const filteredSales = filter === "ALL"
        ? sales
        : sales.filter(s => s.paymentStatus === filter);

    const totalRevenue = sales
        .filter(s => s.paymentStatus === "SUCCESS")
        .reduce((sum, sale) => sum + (sale.finalPrice || 0), 0);

    const handleRefresh = () => {
        refetch();
        toast.success('Sales refreshed');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 bg-muted/30 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading sales...</div>
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
                                <h1 className="font-serif text-2xl font-semibold">Sold Items</h1>
                                <p className="text-sm text-muted-foreground">{sales.length} completed sales</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-card rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">Rs. {totalRevenue.toLocaleString()}</p>
                            </div>
                            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        {["ALL", "SUCCESS", "PENDING", "FAILED"].map((status) => (
                            <Button
                                key={status}
                                variant={filter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status === "ALL" ? "All" : paymentStatusConfig[status as keyof typeof paymentStatusConfig]?.label || status}
                                {status !== "ALL" && (
                                    <span className="ml-2 text-xs opacity-70">
                                        ({sales.filter(s => s.paymentStatus === status).length})
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Failed to load sales
                            <Button size="sm" variant="outline" onClick={handleRefresh} className="ml-auto">
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Sales Table */}
                    <div className="bg-card rounded-xl border overflow-hidden">
                        {filteredSales.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No sales found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-medium">Product</th>
                                            <th className="text-left p-4 font-medium">Winner</th>
                                            <th className="text-right p-4 font-medium">Final Price</th>
                                            <th className="text-left p-4 font-medium">End Date</th>
                                            <th className="text-left p-4 font-medium">Payment</th>
                                            <th className="text-right p-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredSales.map((sale) => {
                                            const statusKey = sale.paymentStatus as keyof typeof paymentStatusConfig;
                                            const status = paymentStatusConfig[statusKey] || paymentStatusConfig.PENDING;
                                            const StatusIcon = status.icon;

                                            return (
                                                <tr key={sale.auctionId} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-medium">{sale.productName}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{sale.winnerName || 'Unknown'}</p>
                                                                <p className="text-xs text-muted-foreground">{sale.winnerEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="text-lg font-bold text-green-600">
                                                            Rs. {sale.finalPrice?.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground">
                                                        {new Date(sale.auctionEndDate).toLocaleDateString()}
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
                                                                <Link to={`/auction/${sale.auctionId}`}>
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

export default SellerSales;

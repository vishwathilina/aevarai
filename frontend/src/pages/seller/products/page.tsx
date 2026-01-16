import { Link, useNavigate } from "react-router-dom";
import { Plus, Package, Clock, CheckCircle2, AlertCircle, Gavel, DollarSign, Edit, Eye, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { sellerApi } from "@/api/seller";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const statusConfig = {
    PENDING: { label: "Pending Review", icon: Clock, color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
    APPROVED: { label: "Approved", icon: CheckCircle2, color: "bg-green-500/20 text-green-600 border-green-500/30" },
    REJECTED: { label: "Rejected", icon: AlertCircle, color: "bg-red-500/20 text-red-600 border-red-500/30" },
    AUCTIONED: { label: "Auctioned", icon: Gavel, color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    SOLD: { label: "Sold", icon: DollarSign, color: "bg-purple-500/20 text-purple-600 border-purple-500/30" },
};

const SellerProducts = () => {
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

    const { data: products = [], isLoading, error, refetch } = useQuery({
        queryKey: ['seller-products'],
        queryFn: sellerApi.getProducts,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
        enabled: isAuthenticated && user?.role === 'AUCTIONEER',
    });

    const filteredProducts = filter === "ALL"
        ? products
        : products.filter(p => p.status === filter);

    const canEdit = (status: string) => status === "PENDING" || status === "REJECTED";

    const handleRefresh = () => {
        refetch();
        toast.success('Products refreshed');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 bg-muted/30 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading products...</div>
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
                                <h1 className="font-serif text-2xl font-semibold">My Products</h1>
                                <p className="text-sm text-muted-foreground">{products.length} products</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Link to="/seller/products/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {["ALL", "PENDING", "APPROVED", "REJECTED", "AUCTIONED", "SOLD"].map((status) => (
                            <Button
                                key={status}
                                variant={filter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status === "ALL" ? "All" : statusConfig[status as keyof typeof statusConfig]?.label || status}
                                {status !== "ALL" && (
                                    <span className="ml-2 text-xs opacity-70">
                                        ({products.filter(p => p.status === status).length})
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Failed to load products
                            <Button size="sm" variant="outline" onClick={handleRefresh} className="ml-auto">
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-card rounded-xl border overflow-hidden">
                        {filteredProducts.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="mb-4">No products found</p>
                                <Link to="/seller/products/new">
                                    <Button variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />Add Your First Product
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-medium">Product</th>
                                            <th className="text-left p-4 font-medium">Category</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-left p-4 font-medium">Created</th>
                                            <th className="text-right p-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredProducts.map((product) => {
                                            const statusKey = product.status as keyof typeof statusConfig;
                                            const status = statusConfig[statusKey] || statusConfig.PENDING;
                                            const StatusIcon = status.icon;

                                            return (
                                                <tr key={product.productId} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-medium">{product.title}</p>
                                                            {product.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                                    {product.description}
                                                                </p>
                                                            )}
                                                            {product.rejectionReason && (
                                                                <p className="text-sm text-destructive mt-1">
                                                                    Reason: {product.rejectionReason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground">{product.category}</td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className={status.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground text-sm">
                                                        {new Date(product.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link to={`/products/${product.productId}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            {canEdit(product.status) && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link to={`/seller/products/${product.productId}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            )}
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

export default SellerProducts;

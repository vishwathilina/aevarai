import { Link, useNavigate } from "react-router-dom";
import { Plus, Package, Clock, CheckCircle2, TrendingUp, Gavel, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { sellerApi } from "@/api/seller";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const statusConfig = {
  PENDING: { label: "Pending Review", icon: Clock, color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "bg-green-500/20 text-green-600 border-green-500/30" },
  REJECTED: { label: "Rejected", icon: AlertCircle, color: "bg-red-500/20 text-red-600 border-red-500/30" },
  AUCTIONED: { label: "Auctioned", icon: Gavel, color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  SOLD: { label: "Sold", icon: DollarSign, color: "bg-purple-500/20 text-purple-600 border-purple-500/30" },
};

const SellerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Role check
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

  // React Query with auto-refetch every 30 seconds
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['seller-dashboard-stats'],
    queryFn: sellerApi.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    enabled: isAuthenticated && user?.role === 'AUCTIONEER',
  });

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerApi.getProducts,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated && user?.role === 'AUCTIONEER',
  });

  const isLoading = statsLoading || productsLoading;
  const recentProducts = products.slice(0, 5);

  const handleRefresh = () => {
    refetchStats();
    refetchProducts();
    toast.success('Data refreshed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Failed to load dashboard</p>
            <Button onClick={handleRefresh}>Retry</Button>
          </div>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your products and track sales</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Link to="/seller/products/new">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Plus className="h-4 w-4 mr-2" />Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-5 hover:shadow-lg transition-shadow">
              <TrendingUp className="h-6 w-6 text-primary mb-3" />
              <p className="text-3xl font-bold font-serif">
                Rs. {stats?.totalSalesAmount?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Sales</p>
            </div>
            <div className="bg-card rounded-xl border p-5 hover:shadow-lg transition-shadow">
              <Package className="h-6 w-6 text-blue-500 mb-3" />
              <p className="text-3xl font-bold font-serif">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Products</p>
            </div>
            <div className="bg-card rounded-xl border p-5 hover:shadow-lg transition-shadow">
              <Gavel className="h-6 w-6 text-orange-500 mb-3" />
              <p className="text-3xl font-bold font-serif">{stats?.activeAuctions || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Active Auctions</p>
            </div>
            <div className="bg-card rounded-xl border p-5 hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-6 w-6 text-green-500 mb-3" />
              <p className="text-3xl font-bold font-serif">{stats?.soldProducts || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Items Sold</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link to="/seller/products" className="bg-card rounded-xl border p-4 hover:bg-muted/50 transition-colors text-center">
              <Package className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">My Products</span>
            </Link>
            <Link to="/seller/auctions" className="bg-card rounded-xl border p-4 hover:bg-muted/50 transition-colors text-center">
              <Gavel className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">My Auctions</span>
            </Link>
            <Link to="/seller/sales" className="bg-card rounded-xl border p-4 hover:bg-muted/50 transition-colors text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Sold Items</span>
            </Link>
            <Link to="/seller/products/new" className="bg-card rounded-xl border p-4 hover:bg-muted/50 transition-colors text-center">
              <Plus className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Add Product</span>
            </Link>
          </div>

          {/* Recent Products */}
          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Recent Products</h2>
              <Link to="/seller/products" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products yet. Add your first product to get started!</p>
                <Link to="/seller/products/new">
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />Add Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentProducts.map((product) => {
                  const statusKey = product.status as keyof typeof statusConfig;
                  const status = statusConfig[statusKey] || statusConfig.PENDING;
                  const StatusIcon = status.icon;
                  return (
                    <div key={product.productId} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        {product.rejectionReason && (
                          <p className="text-sm text-destructive mt-1">Reason: {product.rejectionReason}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;

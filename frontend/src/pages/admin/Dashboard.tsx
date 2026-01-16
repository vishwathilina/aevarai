import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Gavel, Package, AlertTriangle, Play, Square, Plus, FileText, Search, CheckCircle2, XCircle, Clock, Eye, UserPlus, UserMinus, Image as ImageIcon, Download, X, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { productsApi, Product } from "@/api/products";
import { auctionsApi, Auction, AuctionCreateRequest } from "@/api/auctions";
import { usersApi, User } from "@/api/users";
import { getDocumentSignedUrl, getImagePublicUrl } from "@/lib/storage";
import { inspectionsApi, Inspection } from "@/api/inspections";
import { deliveriesApi, Delivery } from "@/api/deliveries";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State for document review
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // State for product media (images and documents)
  const [productMedia, setProductMedia] = useState<{
    [productId: number]: {
      images: { id: number; imageUrl: string; uploadedAt: string }[];
      documents: { id: number; documentUrl: string; documentType: string | null; uploadedAt: string }[];
    };
  }>({});
  const [isViewMediaDialogOpen, setIsViewMediaDialogOpen] = useState(false);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [documentUrls, setDocumentUrls] = useState<{ [key: number]: string }>({});

  // State for physical inspection
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]); // products fully APPROVED (ready for auction)
  const [inspectionQueueProducts, setInspectionQueueProducts] = useState<Product[]>([]); // DOC_APPROVED (ready for inspection)
  const [activeInspections, setActiveInspections] = useState<Record<number, Inspection | null>>({});
  const [actionMode, setActionMode] = useState<"DOC_REVIEW" | "INSPECTION">("DOC_REVIEW");

  // State for auctions
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isCreateAuctionDialogOpen, setIsCreateAuctionDialogOpen] = useState(false);
  const [auctionFormData, setAuctionFormData] = useState<AuctionCreateRequest>({
    productId: 0,
    startPrice: 0,
    minIncrement: 0,
    startTime: "",
    endTime: "",
  });

  // State for users
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // State for deliveries
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to access admin dashboard");
      navigate("/admin/login");
      return;
    }
    if (user?.role !== "ADMIN") {
      toast.error("Access denied. Admin access required.");
      navigate("/access-denied");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      loadAllData();
    }
  }, [isAuthenticated, user]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadPendingProducts(),
      loadApprovedProducts(),
      loadInspectionQueueProducts(),
      loadAuctions(),
      loadUsers(),
      loadDeliveries(),
    ]);
    setIsLoading(false);
  };

  const loadPendingProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await productsApi.getPendingProducts();
      setPendingProducts(data);

      // Load media for all products
      await Promise.all(data.map(product => loadProductMedia(product.id)));
    } catch (error: any) {
      console.error("Error loading pending products:", error);
      toast.error("Failed to load pending products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadProductMedia = async (productId: number) => {
    try {
      const [images, documents] = await Promise.all([
        productsApi.getProductImages(productId).catch(() => []),
        productsApi.getProductDocuments(productId).catch(() => []),
      ]);

      setProductMedia(prev => ({
        ...prev,
        [productId]: { images, documents },
      }));
    } catch (error) {
      console.error(`Error loading media for product ${productId}:`, error);
    }
  };

  const handleViewMedia = async (productId: number) => {
    setViewingProductId(productId);
    setIsViewMediaDialogOpen(true);
    setSelectedImageIndex(0);

    // Load media if not already loaded
    let media = productMedia[productId];
    if (!media) {
      await loadProductMedia(productId);
      // Get fresh media after loading
      const [images, documents] = await Promise.all([
        productsApi.getProductImages(productId).catch(() => []),
        productsApi.getProductDocuments(productId).catch(() => []),
      ]);
      media = { images, documents };
    }

    // Generate signed URLs for documents
    if (media?.documents && media.documents.length > 0) {
      const urls: { [key: number]: string } = {};
      for (const doc of media.documents) {
        try {
          // Check if documentUrl is a path or full URL
          if (doc.documentUrl.startsWith('http')) {
            urls[doc.id] = doc.documentUrl;
          } else {
            // It's a path, generate signed URL
            const signedUrl = await getDocumentSignedUrl(doc.documentUrl);
            urls[doc.id] = signedUrl;
          }
        } catch (error) {
          console.error(`Error generating signed URL for document ${doc.id}:`, error);
          // If it fails, try using the URL as-is
          urls[doc.id] = doc.documentUrl;
        }
      }
      setDocumentUrls(prev => ({ ...prev, ...urls }));
    }
  };

  const loadApprovedProducts = async () => {
    try {
      const data = await productsApi.getApproved();
      setApprovedProducts(data);
    } catch (error: any) {
      console.error("Error loading approved products:", error);
    }
  };

  const loadInspectionQueueProducts = async () => {
    try {
      const data = await inspectionsApi.getPendingProducts();
      setInspectionQueueProducts(data as unknown as Product[]);
    } catch (error: any) {
      console.error("Error loading inspection queue products:", error);
      toast.error("Failed to load inspection queue");
    }
  };

  const loadAuctions = async () => {
    try {
      setIsLoadingAuctions(true);
      // Try to get all auctions, fallback to live auctions if endpoint doesn't exist
      try {
        const data = await auctionsApi.getAll();
        setAuctions(data);
      } catch {
        const liveData = await auctionsApi.getLive();
        setAuctions(liveData);
      }
    } catch (error: any) {
      console.error("Error loading auctions:", error);
    } finally {
      setIsLoadingAuctions(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await usersApi.getAll();
      setAllUsers(data);
    } catch (error: any) {
      console.error("Error loading users:", error);
      // If endpoint doesn't exist, set empty array
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      setIsLoadingDeliveries(true);
      const data = await deliveriesApi.getAll();
      setDeliveries(data);
    } catch (error: any) {
      console.error("Error loading deliveries:", error);
      setDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: number, newStatus: string) => {
    try {
      if (newStatus === "COMPLETED") {
        await deliveriesApi.complete(deliveryId);
        toast.success("Delivery marked as completed");
      } else {
        // For other status updates, use the update endpoint
        await deliveriesApi.update(deliveryId, {});
        toast.success("Delivery status updated");
      }
      loadDeliveries();
    } catch (error: any) {
      console.error("Error updating delivery status:", error);
      toast.error(error.response?.data?.message || "Failed to update delivery status");
    }
  };

  // Document Review Handlers
  const handleApproveProduct = async () => {
    if (!selectedProduct) return;

    try {
      if (actionMode === "DOC_REVIEW") {
        await productsApi.approveProduct(selectedProduct.id, remarks);
        toast.success("Documents approved (moved to inspection queue)");
        setIsApproveDialogOpen(false);
        setRemarks("");
        setSelectedProduct(null);
        loadPendingProducts();
        loadInspectionQueueProducts();
        return;
      }

      // INSPECTION approve: create/reuse inspection then approve it
      const existing = activeInspections[selectedProduct.id];
      const inspection = existing?.id
        ? existing
        : await inspectionsApi.create({
          productId: selectedProduct.id,
          inspectorId: user!.id,
          remarks: remarks || undefined,
        });
      setActiveInspections((prev) => ({ ...prev, [selectedProduct.id]: inspection as unknown as Inspection }));
      await inspectionsApi.approve(inspection.id, remarks || undefined);
      toast.success("Inspection approved. Product is now APPROVED!");
      setIsApproveDialogOpen(false);
      setRemarks("");
      setSelectedProduct(null);
      loadPendingProducts();
      loadApprovedProducts();
      loadInspectionQueueProducts();
    } catch (error: any) {
      console.error("Error approving product:", error);
      toast.error(error.response?.data?.message || "Failed to approve product");
    }
  };

  const handleRejectProduct = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      if (actionMode === "DOC_REVIEW") {
        await productsApi.rejectProduct(selectedProduct.id, rejectionReason);
        toast.success("Documents rejected");
        setIsRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedProduct(null);
        loadPendingProducts();
        return;
      }

      // INSPECTION reject: create/reuse inspection then reject it
      const existing = activeInspections[selectedProduct.id];
      const inspection = existing?.id
        ? existing
        : await inspectionsApi.create({
          productId: selectedProduct.id,
          inspectorId: user!.id,
          remarks: rejectionReason,
        });
      setActiveInspections((prev) => ({ ...prev, [selectedProduct.id]: inspection as unknown as Inspection }));
      await inspectionsApi.reject(inspection.id, rejectionReason);
      toast.success("Inspection rejected. Product is now REJECTED.");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProduct(null);
      loadPendingProducts();
      loadInspectionQueueProducts();
    } catch (error: any) {
      console.error("Error rejecting product:", error);
      toast.error(error.response?.data?.message || "Failed to reject product");
    }
  };

  // Auction Handlers
  const handleCreateAuction = async () => {
    // Validate required fields
    if (!auctionFormData.productId || auctionFormData.productId <= 0) {
      toast.error("Please select a valid product");
      return;
    }

    if (!auctionFormData.startPrice || auctionFormData.startPrice <= 0) {
      toast.error("Start price must be greater than 0");
      return;
    }

    if (!auctionFormData.minIncrement || auctionFormData.minIncrement <= 0) {
      toast.error("Minimum increment must be greater than 0");
      return;
    }

    if (!auctionFormData.startTime || !auctionFormData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate dates
    const startDate = new Date(auctionFormData.startTime);
    const endDate = new Date(auctionFormData.endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return;
    }

    // Check if start time is in the future
    if (startDate <= new Date()) {
      toast.error("Start time must be in the future");
      return;
    }

    try {
      // Convert datetime-local format to ISO string for LocalDateTime
      // datetime-local gives format: "2026-01-15T05:54"
      // LocalDateTime expects: "2026-01-15T05:54:00" (ISO format without timezone)
      const formatDateTime = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return "";

        // datetime-local format is "YYYY-MM-DDTHH:mm"
        // We need "YYYY-MM-DDTHH:mm:ss" for LocalDateTime
        if (dateTimeLocal.length === 16) {
          return dateTimeLocal + ":00";
        }
        // If it already has seconds, return as is
        if (dateTimeLocal.length >= 19) {
          return dateTimeLocal.substring(0, 19); // Remove milliseconds if present
        }
        return dateTimeLocal;
      };

      const startTimeISO = formatDateTime(auctionFormData.startTime);
      const endTimeISO = formatDateTime(auctionFormData.endTime);

      if (!startTimeISO || !endTimeISO) {
        toast.error("Invalid date format");
        return;
      }

      const requestData: AuctionCreateRequest = {
        productId: Number(auctionFormData.productId),
        startPrice: Number(auctionFormData.startPrice),
        minIncrement: Number(auctionFormData.minIncrement),
        startTime: startTimeISO,
        endTime: endTimeISO,
      };

      console.log("Creating auction with data:", JSON.stringify(requestData, null, 2));
      const response = await auctionsApi.create(requestData);
      console.log("Auction created:", response);
      toast.success("Auction created successfully!");
      setIsCreateAuctionDialogOpen(false);
      setAuctionFormData({
        productId: 0,
        startPrice: 0,
        minIncrement: 0,
        startTime: "",
        endTime: "",
      });
      loadAuctions();
      loadApprovedProducts();
    } catch (error: any) {
      console.error("Error creating auction:", error);
      console.error("Error response:", error.response);
      let errorMessage = "Failed to create auction";

      if (error.response) {
        // Backend returned an error response
        const status = error.response.status;
        const data = error.response.data;

        // Spring Boot ResponseStatusException may put message in different places
        if (status === 409) {
          errorMessage = data?.message || data?.error || (typeof data === 'string' ? data : "An auction already exists for this product. Please select a different product.");
        } else if (status === 404) {
          errorMessage = data?.message || data?.error || (typeof data === 'string' ? data : "Product not found. Please select a valid product.");
        } else if (status === 400) {
          errorMessage = data?.message || data?.error || (typeof data === 'string' ? data : "Invalid request. Product must be APPROVED to create an auction.");
        } else {
          errorMessage = data?.message || data?.error || (typeof data === 'string' ? data : error.response.statusText) || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleStartAuction = async (auctionId: number) => {
    try {
      await auctionsApi.start(auctionId);
      toast.success("Auction started!");
      loadAuctions();
    } catch (error: any) {
      console.error("Error starting auction:", error);
      toast.error(error.response?.data?.message || "Failed to start auction");
    }
  };

  const handleEndAuction = async (auctionId: number) => {
    try {
      await auctionsApi.end(auctionId);
      toast.success("Auction ended!");
      loadAuctions();
    } catch (error: any) {
      console.error("Error ending auction:", error);
      toast.error(error.response?.data?.message || "Failed to end auction");
    }
  };

  // User Management Handlers
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await usersApi.deactivate(userId);
        toast.success("User deactivated");
      } else {
        await usersApi.activate(userId);
        toast.success("User activated");
      }
      loadUsers();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string, currentRole: string) => {
    // Prevent changing ADMIN role
    if (currentRole === "ADMIN") {
      toast.error("Cannot change ADMIN role");
      return;
    }

    // Prevent changing to ADMIN role (only through backend/database)
    if (newRole === "ADMIN") {
      toast.error("Cannot assign ADMIN role through UI");
      return;
    }

    try {
      await usersApi.update(userId, { role: newRole });
      toast.success("User role updated successfully");
      loadUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.response?.data?.message || "Failed to update user role");
    }
  };

  // Don't render if not authorized
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  const stats = {
    users: allUsers.length,
    liveAuctions: auctions.filter(a => a.status === "LIVE").length,
    pendingProducts: pendingProducts.length,
    approvedProducts: approvedProducts.length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header simplified />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage auctions, products, and platform operations</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-4">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold font-serif">{stats.users.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <Gavel className="h-5 w-5 text-bid-success mb-2" />
              <p className="text-2xl font-bold font-serif">{stats.liveAuctions}</p>
              <p className="text-sm text-muted-foreground">Live Auctions</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <AlertTriangle className="h-5 w-5 text-bid-warning mb-2" />
              <p className="text-2xl font-bold font-serif">{stats.pendingProducts}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <Package className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold font-serif">{stats.approvedProducts}</p>
              <p className="text-sm text-muted-foreground">Approved Products</p>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="document-review" className="space-y-4">
            <TabsList>
              <TabsTrigger value="document-review">
                <FileText className="h-4 w-4 mr-2" />
                Document Review
              </TabsTrigger>
              <TabsTrigger value="physical-inspection">
                <Search className="h-4 w-4 mr-2" />
                Physical Inspection
              </TabsTrigger>
              <TabsTrigger value="auctions">
                <Gavel className="h-4 w-4 mr-2" />
                Auctions
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="deliveries">
                <Truck className="h-4 w-4 mr-2" />
                Delivery Management
              </TabsTrigger>
            </TabsList>

            {/* Document Review Tab */}
            <TabsContent value="document-review" className="space-y-4">
              <div className="bg-card rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold">Pending Products for Document Review</h2>
                  <Button variant="outline" size="sm" onClick={loadPendingProducts}>
                    Refresh
                  </Button>
                </div>
                {isLoadingProducts ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : pendingProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending products for review</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingProducts.map((product) => {
                      const media = productMedia[product.id];
                      const hasImages = media?.images && media.images.length > 0;
                      const hasDocuments = media?.documents && media.documents.length > 0;

                      return (
                        <div key={product.id} className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span>Category: {product.category}</span>
                                <span>•</span>
                                <span>Submitted: {new Date(product.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={hasImages ? "text-bid-success" : "text-muted-foreground"}>
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  {hasImages ? `${media.images.length} Image(s)` : "No Images"}
                                </Badge>
                                <Badge variant="outline" className={hasDocuments ? "text-primary" : "text-muted-foreground"}>
                                  <FileText className="h-3 w-3 mr-1" />
                                  {hasDocuments ? `${media.documents.length} Document(s)` : "No Documents"}
                                </Badge>
                              </div>
                            </div>
                            <Badge className="bg-bid-warning text-background">
                              <Clock className="h-3 w-3 mr-1" />Pending
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMedia(product.id)}
                              disabled={!hasImages && !hasDocuments}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Media
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setActionMode("DOC_REVIEW");
                                setSelectedProduct(product);
                                setRemarks("");
                                setIsApproveDialogOpen(true);
                              }}
                              className="bg-bid-success hover:bg-bid-success/90"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setActionMode("DOC_REVIEW");
                                setSelectedProduct(product);
                                setRejectionReason("");
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Physical Inspection Tab */}
            <TabsContent value="physical-inspection" className="space-y-4">
              <div className="bg-card rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold">Products Ready for Physical Inspection</h2>
                  <Button variant="outline" size="sm" onClick={loadInspectionQueueProducts}>
                    Refresh
                  </Button>
                </div>
                {inspectionQueueProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products ready for physical inspection</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {inspectionQueueProducts.map((product) => (
                      <div key={product.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Category: {product.category}</span>
                              <span>•</span>
                              <span>Submitted: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}</span>
                            </div>
                          </div>
                          <Badge className="bg-bid-success text-background">
                            <CheckCircle2 className="h-3 w-3 mr-1" />Ready for Inspection
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setActionMode("INSPECTION");
                              setSelectedProduct(product);
                              setRemarks("");
                              setIsApproveDialogOpen(true);
                            }}
                            className="bg-bid-success hover:bg-bid-success/90"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Inspection
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setActionMode("INSPECTION");
                              setSelectedProduct(product);
                              setRejectionReason("");
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Inspection
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Auctions Tab */}
            <TabsContent value="auctions" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Auction Management</h2>
                <Button onClick={() => {
                  setAuctionFormData({
                    productId: 0,
                    startPrice: 0,
                    minIncrement: 0,
                    startTime: "",
                    endTime: "",
                  });
                  setIsCreateAuctionDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />Create Auction
                </Button>
              </div>
              <div className="bg-card rounded-xl border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">All Auctions</h3>
                </div>
                {isLoadingAuctions ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : auctions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No auctions found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {auctions.map((auction) => (
                      <div key={auction.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auction #{auction.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Product ID: {auction.productId} • Start: Rs. {auction.startPrice.toLocaleString()}
                            {auction.currentPrice && ` • Current: Rs. ${auction.currentPrice.toLocaleString()}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(auction.startTime).toLocaleString()} - {new Date(auction.endTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={auction.status === "LIVE" ? "bg-bid-success text-background" : auction.status === "SCHEDULED" ? "bg-bid-warning text-background" : "bg-muted"}>
                            {auction.status}
                          </Badge>
                          {auction.status === "SCHEDULED" && (
                            <Button variant="outline" size="sm" onClick={() => handleStartAuction(auction.id)}>
                              <Play className="h-3 w-3 mr-1" />Start
                            </Button>
                          )}
                          {auction.status === "LIVE" && (
                            <Button variant="outline" size="sm" onClick={() => handleEndAuction(auction.id)}>
                              <Square className="h-3 w-3 mr-1" />End
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="bg-card rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold">User Management</h2>
                  <Button variant="outline" size="sm" onClick={loadUsers}>
                    Refresh
                  </Button>
                </div>
                {isLoadingUsers ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : allUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allUsers.map((user) => (
                      <div key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={user.active ? "bg-bid-success text-background" : "bg-destructive text-destructive-foreground"}>
                                {user.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-2 min-w-[180px]">
                              <Label className="text-xs text-muted-foreground">Role</Label>
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value, user.role)}
                                disabled={user.role === "ADMIN"}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BIDDER">BIDDER</SelectItem>
                                  <SelectItem value="AUCTIONEER">AUCTIONEER</SelectItem>
                                  <SelectItem value="INSPECTOR">INSPECTOR</SelectItem>
                                  {user.role === "ADMIN" && (
                                    <SelectItem value="ADMIN" disabled>ADMIN (Protected)</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label className="text-xs text-muted-foreground opacity-0">Actions</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, user.active)}
                                disabled={user.role === "ADMIN"}
                              >
                                {user.active ? (
                                  <>
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Delivery Management Tab */}
            <TabsContent value="deliveries" className="space-y-4">
              <div className="bg-card rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold">Delivery Management</h2>
                  <Button variant="outline" size="sm" onClick={loadDeliveries}>
                    Refresh
                  </Button>
                </div>
                {isLoadingDeliveries ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : deliveries.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No deliveries found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {deliveries.map((delivery) => (
                      <div key={delivery.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">Delivery #{delivery.id}</p>
                            <p className="text-sm text-muted-foreground">
                              Auction ID: {delivery.auctionId} • Type: {delivery.deliveryType || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Fee: ${delivery.deliveryFee?.toFixed(2) || "0.00"} • Created: {new Date(delivery.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={delivery.status === "COMPLETED" ? "bg-bid-success text-background" : "bg-bid-warning text-background"}>
                              {delivery.status}
                            </Badge>
                            {delivery.status === "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateDeliveryStatus(delivery.id, "COMPLETED")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Approve Product Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Product</DialogTitle>
            <DialogDescription>
              Approve "{selectedProduct?.title}" for auction. You can add optional remarks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any remarks about this approval..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveProduct} className="bg-bid-success hover:bg-bid-success/90">
              Approve Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Product Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Reject "{selectedProduct?.title}". Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this product is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectProduct}
              disabled={!rejectionReason.trim()}
            >
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Auction Dialog */}
      <Dialog
        open={isCreateAuctionDialogOpen}
        onOpenChange={(open) => {
          setIsCreateAuctionDialogOpen(open);
          if (open) {
            // Refresh auctions when opening dialog to ensure accurate filtering
            loadAuctions();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Auction</DialogTitle>
            <DialogDescription>
              Create an auction for an approved product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product *</Label>
              <Select
                value={auctionFormData.productId?.toString() || ""}
                onValueChange={(value) => setAuctionFormData({ ...auctionFormData, productId: parseInt(value) || 0 })}
              >
                <SelectTrigger id="productId">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {approvedProducts
                    .filter(product => !auctions.some(auction => auction.productId === product.id))
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        #{product.id} - {product.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {approvedProducts.filter(product => !auctions.some(auction => auction.productId === product.id)).length === 0 && (
                <p className="text-sm text-muted-foreground">No available products. All approved products already have auctions.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPrice">Start Price (Rs.) *</Label>
                <Input
                  id="startPrice"
                  type="number"
                  step="0.01"
                  value={auctionFormData.startPrice || ""}
                  onChange={(e) => setAuctionFormData({ ...auctionFormData, startPrice: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minIncrement">Min Increment (Rs.) *</Label>
                <Input
                  id="minIncrement"
                  type="number"
                  step="0.01"
                  value={auctionFormData.minIncrement || ""}
                  onChange={(e) => setAuctionFormData({ ...auctionFormData, minIncrement: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={auctionFormData.startTime}
                  onChange={(e) => setAuctionFormData({ ...auctionFormData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={auctionFormData.endTime}
                  onChange={(e) => setAuctionFormData({ ...auctionFormData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAuctionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAuction}>
              Create Auction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Media Dialog */}
      <Dialog open={isViewMediaDialogOpen} onOpenChange={setIsViewMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Media</DialogTitle>
            <DialogDescription>
              View images and documents for product review
            </DialogDescription>
          </DialogHeader>
          {viewingProductId && productMedia[viewingProductId] && (
            <div className="space-y-6">
              {/* Images Section */}
              {productMedia[viewingProductId].images && productMedia[viewingProductId].images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images ({productMedia[viewingProductId].images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {productMedia[viewingProductId].images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer border rounded-lg overflow-hidden"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 border-2 border-primary bg-primary/10" />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Large Image Viewer */}
                  {selectedImageIndex < productMedia[viewingProductId].images.length && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <img
                        src={productMedia[viewingProductId].images[selectedImageIndex].imageUrl}
                        alt={`Selected image ${selectedImageIndex + 1}`}
                        className="w-full max-h-96 object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          Image {selectedImageIndex + 1} of {productMedia[viewingProductId].images.length}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                            disabled={selectedImageIndex === 0}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedImageIndex(Math.min(productMedia[viewingProductId].images.length - 1, selectedImageIndex + 1))}
                            disabled={selectedImageIndex === productMedia[viewingProductId].images.length - 1}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Section */}
              {productMedia[viewingProductId].documents && productMedia[viewingProductId].documents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents ({productMedia[viewingProductId].documents.length})
                  </h3>
                  <div className="space-y-2">
                    {productMedia[viewingProductId].documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">
                              Document {doc.id}
                              {doc.documentType && (
                                <Badge variant="outline" className="ml-2">
                                  {doc.documentType}
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              let url = documentUrls[doc.id];
                              if (!url) {
                                // Generate signed URL if not already generated
                                if (doc.documentUrl.startsWith('http')) {
                                  url = doc.documentUrl;
                                } else {
                                  url = await getDocumentSignedUrl(doc.documentUrl);
                                  setDocumentUrls(prev => ({ ...prev, [doc.id]: url }));
                                }
                              }
                              window.open(url, '_blank');
                            } catch (error) {
                              console.error("Error opening document:", error);
                              toast.error("Failed to open document");
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View/Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!productMedia[viewingProductId].images || productMedia[viewingProductId].images.length === 0) &&
                (!productMedia[viewingProductId].documents || productMedia[viewingProductId].documents.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No media available for this product</p>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewMediaDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

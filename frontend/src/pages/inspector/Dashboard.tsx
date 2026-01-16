import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle2, XCircle, Clock, Package, FileText, Image as ImageIcon, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { productsApi, Product } from "@/api/products";
import { inspectionsApi, Inspection } from "@/api/inspections";
import { toast } from "sonner";
import { getDocumentSignedUrl } from "@/lib/storage";

const InspectorDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeInspections, setActiveInspections] = useState<Record<number, Inspection | null>>({});

  // State for product media
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

  // Redirect if not authenticated or not an inspector (ONLY INSPECTOR, not ADMIN)
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to access inspector dashboard");
      navigate("/inspector/login");
      return;
    }
    if (user?.role !== "INSPECTOR") {
      toast.error("Access denied. Inspector access required.");
      navigate("/access-denied");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "INSPECTOR") {
      loadPendingProducts();
    }
  }, [isAuthenticated, user]);

  const loadPendingProducts = async () => {
    try {
      setIsLoading(true);
      const data = await inspectionsApi.getPendingProducts();
      setProducts(data as unknown as Product[]);
      
      // Load media for all products
      await Promise.all(data.map(product => loadProductMedia(product.id)));
    } catch (error: any) {
      console.error("Error loading products:", error);
      toast.error("Failed to load pending products");
    } finally {
      setIsLoading(false);
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
          urls[doc.id] = doc.documentUrl;
        }
      }
      setDocumentUrls(prev => ({ ...prev, ...urls }));
    }
  };

  const ensureInspectionForProduct = async (productId: number) => {
    // Reuse existing inspection if present; otherwise create one (moves product to INSPECTION_PENDING)
    const existing = activeInspections[productId];
    if (existing?.id) return existing;

    const created = await inspectionsApi.create({
      productId,
      inspectorId: user!.id,
      remarks: remarks || undefined,
    });
    setActiveInspections((prev) => ({ ...prev, [productId]: created as unknown as Inspection }));
    return created as unknown as Inspection;
  };

  const handleApprove = async () => {
    if (!selectedProduct) return;

    try {
      const inspection = await ensureInspectionForProduct(selectedProduct.id);
      await inspectionsApi.approve(inspection.id, remarks || undefined);
      toast.success("Inspection approved. Product is now APPROVED!");
      setIsApproveDialogOpen(false);
      setRemarks("");
      setSelectedProduct(null);
      loadPendingProducts();
    } catch (error: any) {
      console.error("Error approving inspection:", error);
      toast.error(error.response?.data?.message || "Failed to approve inspection");
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const inspection = await ensureInspectionForProduct(selectedProduct.id);
      await inspectionsApi.reject(inspection.id, rejectionReason);
      toast.success("Inspection rejected. Product is now REJECTED.");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProduct(null);
      loadPendingProducts();
    } catch (error: any) {
      console.error("Error rejecting inspection:", error);
      toast.error(error.response?.data?.message || "Failed to reject inspection");
    }
  };

  const openApproveDialog = (product: Product) => {
    setSelectedProduct(product);
    setRemarks("");
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (product: Product) => {
    setSelectedProduct(product);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  if (!isAuthenticated || user?.role !== "INSPECTOR") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold mb-2">Inspector Dashboard</h1>
            <p className="text-muted-foreground">Review and approve products for auction</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-4">
              <Clock className="h-5 w-5 text-bid-warning mb-2" />
              <p className="text-2xl font-bold font-serif">{products.length}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <CheckCircle2 className="h-5 w-5 text-bid-success mb-2" />
              <p className="text-2xl font-bold font-serif">-</p>
              <p className="text-sm text-muted-foreground">Approved Today</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <XCircle className="h-5 w-5 text-destructive mb-2" />
              <p className="text-2xl font-bold font-serif">-</p>
              <p className="text-sm text-muted-foreground">Rejected Today</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <Package className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold font-serif">-</p>
              <p className="text-sm text-muted-foreground">Total Reviewed</p>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Pending Products</h2>
              <Button variant="outline" size="sm" onClick={loadPendingProducts}>
                Refresh
              </Button>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending products to review</p>
              </div>
            ) : (
              <div className="divide-y">
                {products.map((product) => {
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
                            {product.handlingFeePaid && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">Fee Paid</Badge>
                              </>
                            )}
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
                      <div className="flex items-center gap-2 mt-4">
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
                          onClick={() => openApproveDialog(product)}
                          className="bg-bid-success hover:bg-bid-success/90"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectDialog(product)}
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
        </div>
      </main>
      <Footer />

      {/* Approve Dialog */}
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
            <Button onClick={handleApprove} className="bg-bid-success hover:bg-bid-success/90">
              Approve Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
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
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Product
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
              Review images and documents before approving or rejecting
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

export default InspectorDashboard;

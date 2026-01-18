import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Calendar, Tag, FileText, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productsApi, Product } from "@/api/products";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const productId = Number(id);

    const { data: product, isLoading: productLoading, error: productError } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsApi.getById(productId),
        enabled: !!productId,
        retry: 1,
    });

    const { data: images = [], isLoading: imagesLoading } = useQuery({
        queryKey: ['product-images', productId],
        queryFn: () => productsApi.getProductImages(productId),
        enabled: !!productId,
    });

    const { data: documents = [], isLoading: documentsLoading } = useQuery({
        queryKey: ['product-documents', productId],
        queryFn: () => productsApi.getProductDocuments(productId),
        enabled: !!productId,
    });

    const isLoading = productLoading || imagesLoading || documentsLoading;

    if (isNaN(productId)) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container py-12 text-center">
                    <p className="text-destructive mb-4">Invalid Product ID</p>
                    <Link to="/">
                        <Button>Go Home</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading specific product details...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (productError || !product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container py-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                    <p className="text-muted-foreground mb-6">The product you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
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
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-card rounded-xl border flex items-center justify-center overflow-hidden relative">
                                {images.length > 0 ? (
                                    <img
                                        src={images[0].imageUrl}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-20" />
                                        <p>No image available</p>
                                    </div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.slice(1).map((img) => (
                                        <div key={img.id} className="aspect-square bg-card rounded-lg border overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all">
                                            <img
                                                src={img.imageUrl}
                                                alt="Product thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Details */}
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-start justify-between">
                                    <h1 className="text-3xl font-serif font-bold mb-2">{product.title}</h1>
                                    <Badge variant="outline" className="mt-1">
                                        {product.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <span className="flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        {product.category}
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Listed {new Date(product.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Documents Section */}
                            {documents.length > 0 && (
                                <div className="bg-card rounded-xl border p-5">
                                    <h3 className="font-semibold mb-4 flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Documents & Certificates
                                    </h3>
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <a
                                                key={doc.id}
                                                href={doc.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-background flex items-center justify-center border">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{doc.documentType || 'Document'}</p>
                                                        <p className="text-xs text-muted-foreground">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info Cards (Optional, placeholder for now) */}
                            {product.rejectionReason && (
                                <div className="bg-destructive/10 text-destructive rounded-xl border border-destructive/20 p-4">
                                    <h3 className="font-semibold mb-1">Rejection Reason</h3>
                                    <p className="text-sm">{product.rejectionReason}</p>
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

export default ProductDetails;

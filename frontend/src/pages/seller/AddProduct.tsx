import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { productsApi } from "@/api/products";
import { uploadMultipleDocuments, uploadMultipleImages, getImagePublicUrl, getDocumentSignedUrl, getSupabaseUrl } from "@/lib/storage";

const categories = [
    "Archeology",
    "Art",
    "Books & Comics",
    "Ancient Vehicles",
    "Coins & Bars",
    "Watches",
    "Fashion",
    "Stamps",
    "Jewelry",
    "Antiques",
];

const Sell = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        handlingFeePaid: false,
    });
    const [images, setImages] = useState<File[]>([]);
    const [documents, setDocuments] = useState<File[]>([]);

    // Redirect if not authenticated or not a seller
    if (!isAuthenticated) {
        toast.error("Please login to sell items");
        navigate("/login");
        return null;
    }

    if (user?.role !== "SELLER" && user?.role !== "AUCTIONEER") {
        toast.error("Only sellers can list products");
        navigate("/access-denied");
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validImages = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });
        setImages(prev => [...prev, ...validImages]);
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validDocs = files.filter(file => {
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error(`${file.name} must be PDF or DOCX`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error(`${file.name} is too large (max 10MB)`);
                return false;
            }
            return true;
        });
        setDocuments(prev => [...prev, ...validDocs]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (images.length === 0) {
            toast.error("Please add at least one product image");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Submit product to backend first
            const productResponse = await productsApi.submitProduct({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                handlingFeePaid: formData.handlingFeePaid,
            });

            const productId = productResponse.id;
            toast.success("Product submitted successfully!");

            // 2. Upload files to Supabase and save URLs to backend
            try {
                if (images.length > 0) {
                    const imagePaths = await uploadMultipleImages(images, productId);
                    toast.success("Images uploaded to storage!");

                    // 3. Save image URLs to backend database
                    const imageUrls = imagePaths.map(path => getImagePublicUrl(path));

                    await productsApi.addProductImages(productId, imageUrls);
                    toast.success("Image URLs saved to database!");
                }

                if (documents.length > 0) {
                    const documentPaths = await uploadMultipleDocuments(documents, productId);
                    toast.success("Documents uploaded to storage!");

                    // Save document URLs to backend database
                    // Store the storage path - signed URLs will be generated when documents are accessed
                    const documentData = documentPaths.map((path, index) => {
                        const file = documents[index];
                        // Determine document type from file extension
                        const documentType = file.name.endsWith('.pdf') ? 'PDF' : 
                                           file.name.endsWith('.docx') ? 'DOCX' : 
                                           'OTHER';
                        // Store the storage path - this will be used to generate signed URLs when needed
                        return {
                            documentUrl: path,
                            documentType: documentType
                        };
                    });

                    await productsApi.addProductDocuments(productId, documentData);
                    toast.success("Document URLs saved to database!");
                }
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                toast.warning("Product submitted but file upload failed. You can add files later.");
            }

            // Navigate to seller dashboard
            navigate("/seller/dashboard");
        } catch (error: any) {
            console.error("Submit error:", error);
            console.error("Error response:", error.response);
            console.error("Error status:", error.response?.status);
            console.error("Error data:", error.response?.data);
            console.error("Request config:", error.config);
            
            // Check authentication
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('user');
            console.log("Auth token exists:", !!token);
            console.log("User data:", user);
            
            let errorMessage = "Failed to submit product";
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 401) {
                    errorMessage = "Authentication failed. Please login again.";
                } else if (status === 403) {
                    errorMessage = "Access denied. You need AUCTIONEER role to submit products.";
                } else if (status === 400) {
                    errorMessage = data?.message || "Invalid product data. Please check all fields.";
                } else if (status === 500) {
                    errorMessage = data?.message || "Server error. Please try again later.";
                } else {
                    errorMessage = data?.message || data?.error || error.response.statusText || errorMessage;
                }
            } else if (error.message) {
                errorMessage = error.message;
            } else if (!error.response) {
                errorMessage = "Network error. Please check your connection and ensure the backend is running.";
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2">
                                List Your Item
                            </h1>
                            <p className="text-muted-foreground">
                                Fill in the details below to submit your product for review
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Product Details Card */}
                            <div className="bg-card rounded-xl border p-6 space-y-4">
                                <h2 className="font-serif text-xl font-semibold mb-4">Product Details</h2>

                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Product Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Vintage Rolex Submariner 1985"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">
                                        Category <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide detailed information about your item including condition, history, provenance, etc."
                                        rows={6}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Minimum 50 characters. Be detailed to attract more bidders.
                                    </p>
                                </div>
                            </div>

                            {/* Images Upload Card */}
                            <div className="bg-card rounded-xl border p-6 space-y-4">
                                <h2 className="font-serif text-xl font-semibold mb-4">Product Images</h2>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="images">
                                            Upload Images <span className="text-destructive">*</span>
                                        </Label>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Add high-quality images (max 5MB each, JPG/PNG)
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <Button type="button" variant="outline" className="relative" asChild>
                                                <label htmlFor="images" className="cursor-pointer">
                                                    <ImageIcon className="mr-2 h-4 w-4" />
                                                    Choose Images
                                                    <input
                                                        id="images"
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </label>
                                            </Button>
                                            <span className="text-sm text-muted-foreground">{images.length} image(s) selected</span>
                                        </div>
                                    </div>

                                    {images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {images.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents Upload Card */}
                            <div className="bg-card rounded-xl border p-6 space-y-4">
                                <h2 className="font-serif text-xl font-semibold mb-4">Supporting Documents</h2>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="documents">Upload Documents (Optional)</Label>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Certificates, ownership papers, inspection reports (PDF/DOCX, max 10MB)
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <Button type="button" variant="outline" className="relative" asChild>
                                                <label htmlFor="documents" className="cursor-pointer">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Choose Documents
                                                    <input
                                                        id="documents"
                                                        type="file"
                                                        accept=".pdf,.docx"
                                                        multiple
                                                        onChange={handleDocumentChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </label>
                                            </Button>
                                            <span className="text-sm text-muted-foreground">{documents.length} document(s) selected</span>
                                        </div>
                                    </div>

                                    {documents.length > 0 && (
                                        <div className="space-y-2">
                                            {documents.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeDocument(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fee Agreement */}
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="fee"
                                        checked={formData.handlingFeePaid}
                                        onCheckedChange={(checked) => setFormData({ ...formData, handlingFeePaid: checked as boolean })}
                                    />
                                    <div>
                                        <Label htmlFor="fee" className="cursor-pointer">
                                            I agree to pay the handling fee
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            A small handling fee will be charged upon sale to cover platform costs
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Submitting..." : "Submit for Review"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                Your product will be reviewed by our team before going live. This usually takes 1-2 business days.
                            </p>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Sell;

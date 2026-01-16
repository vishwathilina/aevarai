import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ChevronDown, MapPin, CreditCard, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsApi } from "@/api/auctions";
import { paymentsApi } from "@/api/payments";
import { deliveriesApi } from "@/api/deliveries";
import { productsApi } from "@/api/products";

// Initialize Stripe with publishable key
const stripePromise = loadStripe("pk_test_51SlVv4RkaBQILD6AyG5PZJbsO71BTsok0R6gdhK5nVsuwlLLUYNwazqfOLxyRGmnXom7E8y9b0ZdO5zUTfgvanoZ00VtvmqTBr");

const CheckoutForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [shipping, setShipping] = useState("PICKUP");
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [wantInvoice, setWantInvoice] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [deliveryId, setDeliveryId] = useState<number | null>(null);

    // Fetch auction details
    const { data: auction, isLoading: auctionLoading } = useQuery({
        queryKey: ['auction', id],
        queryFn: () => auctionsApi.getById(Number(id)),
        enabled: !!id,
    });

    // Fetch product details
    const { data: product } = useQuery({
        queryKey: ['product', auction?.productId],
        queryFn: () => productsApi.getById(auction!.productId),
        enabled: !!auction?.productId,
    });

    // Fetch product images
    const { data: productImages = [] } = useQuery({
        queryKey: ['productImages', auction?.productId],
        queryFn: () => productsApi.getProductImages(auction!.productId),
        enabled: !!auction?.productId,
    });

    // Fetch existing payment
    const { data: existingPayment } = useQuery({
        queryKey: ['payment', 'auction', id],
        queryFn: () => paymentsApi.getByAuction(Number(id!)),
        enabled: !!id,
        retry: false,
    });

    // Fetch existing delivery
    const { data: existingDelivery } = useQuery({
        queryKey: ['delivery', 'auction', id],
        queryFn: () => deliveriesApi.getByAuction(Number(id!)),
        enabled: !!id,
        retry: false,
    });

    // Initialize payment intent
    useEffect(() => {
        // If we already have a client secret, don't re-initialize
        if (clientSecret) {
            return;
        }

        // If existing payment has client secret, use it
        if (existingPayment?.clientSecret) {
            console.log("Using existing payment client secret");
            setClientSecret(existingPayment.clientSecret);
            return;
        }

        // If payment is already successful, don't initialize
        if (existingPayment?.status === "SUCCESS") {
            console.log("Payment already successful");
            return;
        }

        const initPayment = async () => {
            if (!auction) {
                console.log("Waiting for auction data...");
                return;
            }

            // Check if user is authenticated
            if (!user) {
                toast.error("Please login to complete payment");
                return;
            }

            // Check if auction is ended
            if (auction.status !== "ENDED") {
                toast.error("Auction is not ended yet");
                return;
            }

            try {
                console.log("Initializing payment for auction:", id);
                const paymentResponse = await paymentsApi.initiateCheckout({
                    auctionId: Number(id!),
                });
                console.log("Payment response:", paymentResponse);

                if (paymentResponse.clientSecret) {
                    setClientSecret(paymentResponse.clientSecret);
                    console.log("Client secret set successfully");
                } else {
                    console.error("No client secret in response:", paymentResponse);
                    toast.error("Failed to get payment details. Please try again.");
                }
            } catch (error: any) {
                console.error("Error initializing payment:", error);
                const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to initialize payment";
                toast.error(errorMessage);
            }
        };

        if (auction && user) {
            initPayment();
        }
    }, [auction, existingPayment, id, user, clientSecret]);

    // Set delivery from existing
    useEffect(() => {
        if (existingDelivery) {
            setShipping(existingDelivery.deliveryType);
            setDeliveryFee(existingDelivery.deliveryFee);
            setDeliveryId(existingDelivery.id);
        }
    }, [existingDelivery]);

    const createDeliveryMutation = useMutation({
        mutationFn: (data: { auctionId: number; deliveryType: string; deliveryFee: number }) =>
            deliveriesApi.create(data),
        onSuccess: (data) => {
            setDeliveryId(data.id);
            queryClient.invalidateQueries({ queryKey: ['delivery', 'auction', id] });
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                // Delivery already exists, try to update
                if (deliveryId) {
                    updateDeliveryMutation.mutate({
                        id: deliveryId,
                        data: {
                            auctionId: Number(id!),
                            deliveryType: shipping,
                            deliveryFee,
                        },
                    });
                }
            } else {
                toast.error("Failed to create delivery");
            }
        },
    });

    const updateDeliveryMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => deliveriesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery', 'auction', id] });
        },
        onError: () => {
            toast.error("Failed to update delivery");
        },
    });

    const handleShippingChange = (value: string) => {
        setShipping(value);
        const fee = value === "PICKUP" ? 0 : 500.00;
        setDeliveryFee(fee);

        // Create or update delivery
        if (deliveryId) {
            updateDeliveryMutation.mutate({
                id: deliveryId,
                data: {
                    auctionId: Number(id!),
                    deliveryType: value,
                    deliveryFee: fee,
                },
            });
        } else if (auction) {
            createDeliveryMutation.mutate({
                auctionId: Number(id!),
                deliveryType: value,
                deliveryFee: fee,
            });
        }
    };

    const handlePayment = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            toast.error("Payment system not ready");
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                toast.error("Card element not found");
                setIsProcessing(false);
                return;
            }

            // Confirm payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: user?.name || "Customer",
                        email: user?.email,
                    },
                },
            });

            if (error) {
                toast.error(error.message || "Payment failed");
                setIsProcessing(false);
                return;
            }

            if (paymentIntent?.status === "succeeded") {
                // Create delivery if not exists
                if (!deliveryId && auction) {
                    await createDeliveryMutation.mutateAsync({
                        auctionId: Number(id!),
                        deliveryType: shipping,
                        deliveryFee,
                    });
                }

                toast.success("Payment successful!", {
                    description: "Your order has been confirmed.",
                });

                // Invalidate queries
                queryClient.invalidateQueries({ queryKey: ['payment', 'auction', id] });
                queryClient.invalidateQueries({ queryKey: ['auctions', 'won', user?.id] });

                // Navigate to won auctions
                setTimeout(() => {
                    navigate("/won-auctions");
                }, 2000);
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error.message || "Payment failed");
        } finally {
            setIsProcessing(false);
        }
    };

    if (auctionLoading || !auction) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (existingPayment?.status === "SUCCESS") {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <main className="container py-8">
                    <div className="max-w-4xl mx-auto bg-card rounded-xl border p-8 text-center">
                        <h1 className="text-2xl font-semibold mb-4">Payment Already Completed</h1>
                        <p className="text-muted-foreground mb-6">
                            This auction has already been paid for.
                        </p>
                        <Link to="/won-auctions">
                            <Button>View Won Auctions</Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const winningBid = auction.currentPrice || auction.startPrice;
    const total = winningBid + deliveryFee;
    const imageUrl = productImages[0]?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";

    return (
        <div className="min-h-screen bg-muted/30">
            <Header />

            <main className="container py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-2xl font-semibold">Complete the transaction</h1>
                            <p className="text-muted-foreground mt-1">Secure checkout powered by Stripe</p>
                        </div>
                    </div>

                    <form onSubmit={handlePayment}>
                        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                            {/* Left Column - Forms */}
                            <div className="space-y-6">
                                {/* Won Item Summary */}
                                <div className="bg-card rounded-xl border p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-medium">Won item</span>
                                        <span className="text-muted-foreground">
                                            Rs. {winningBid.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 mt-4 pt-4 border-t">
                                        <img
                                            src={imageUrl}
                                            alt={auction.productTitle || "Auction item"}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{auction.productTitle || `Auction #${auction.auctionId}`}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product?.description?.substring(0, 50)}...
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping */}
                                <div className="bg-card rounded-xl border p-6">
                                    <h2 className="font-semibold mb-4">Delivery Method</h2>

                                    <RadioGroup value={shipping} onValueChange={handleShippingChange} className="space-y-3">
                                        <label
                                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${shipping === "PICKUP" ? "border-primary bg-accent" : "border-border"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value="PICKUP" />
                                                <span className="font-medium">Pick-up</span>
                                            </div>
                                            <span className="font-medium">Free</span>
                                        </label>
                                        <label
                                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${shipping === "DELIVERY" ? "border-primary bg-accent" : "border-border"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value="DELIVERY" />
                                                <span className="font-medium">Delivery</span>
                                            </div>
                                            <span className="font-medium">Rs. 500.00</span>
                                        </label>
                                    </RadioGroup>

                                    {shipping === "PICKUP" && (
                                        <div className="mt-4 p-4 bg-muted rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">Pick-up point</span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <p className="font-medium">Platform Warehouse</p>
                                                <p className="text-muted-foreground">Contact seller for pickup details</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="bg-card rounded-xl border p-6">
                                    <h2 className="font-semibold mb-4">Payment method</h2>

                                    {clientSecret ? (
                                        <div className="space-y-4">
                                            <div className="p-4 border rounded-lg">
                                                <Label htmlFor="card-element" className="text-sm mb-2 block">
                                                    Card Details
                                                </Label>
                                                <div className="p-3 border rounded-md bg-background">
                                                    <CardElement
                                                        id="card-element"
                                                        options={{
                                                            style: {
                                                                base: {
                                                                    fontSize: "16px",
                                                                    color: "#424770",
                                                                    "::placeholder": {
                                                                        color: "#aab7c4",
                                                                    },
                                                                },
                                                                invalid: {
                                                                    color: "#9e2146",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 border rounded-lg text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            <p>Initializing payment...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="lg:sticky lg:top-8 h-fit">
                                <div className="bg-card rounded-xl border p-6">
                                    <h2 className="font-semibold mb-4">Order summary</h2>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Won item</span>
                                            <span>Rs. {winningBid.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Delivery ({shipping})</span>
                                            <span>Rs. {deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Service fee</span>
                                            <span className="text-bid-success">Free</span>
                                        </div>
                                    </div>

                                    <div className="border-t mt-4 pt-4">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span>Rs. {total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        size="lg"
                                        disabled={isProcessing || !clientSecret || !stripe}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay Rs. ${total.toLocaleString()}`
                                        )}
                                    </Button>

                                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-center">
                                        <Shield className="h-4 w-4" />
                                        <span>Secured by Stripe • 256-bit SSL encryption</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

const Checkout = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default Checkout;

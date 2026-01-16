import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import Category from "./pages/Category";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyBids from "./pages/MyBids";
import WonAuctions from "./pages/WonAuctions";
import Checkout from "./pages/Checkout";
import Notifications from "./pages/Notifications";
import AccessDenied from "./pages/AccessDenied";
import SellerDashboard from "./pages/seller/dashboard/page";
import SellerProducts from "./pages/seller/products/page";
import SellerAuctions from "./pages/seller/auctions/page";
import SellerSales from "./pages/seller/sales/page";
import ProductDetails from "./pages/ProductDetails";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import InspectorDashboard from "./pages/inspector/Dashboard";
import InspectorLogin from "./pages/inspector/InspectorLogin";
import NotFound from "./pages/NotFound";
import AddProduct from "./pages/seller/AddProduct";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-bids" element={<MyBids />} />
            <Route path="/won-auctions" element={<WonAuctions />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/sell" element={<AddProduct />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/products/new" element={<AddProduct />} />
            <Route path="/seller/auctions" element={<SellerAuctions />} />
            <Route path="/seller/sales" element={<SellerSales />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Inspector Routes */}
            <Route path="/inspector/login" element={<InspectorLogin />} />
            <Route path="/inspector/dashboard" element={<InspectorDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


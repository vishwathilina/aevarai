import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      // Check role after login
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') {
        navigate("/admin/dashboard");
      } else {
        toast.error("Access denied. Admin access required.");
        navigate("/access-denied");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <img src="/logo.png" alt="Logo" className="h-16" />
            </Link>
            <h1 className="font-serif text-3xl font-semibold mb-2">Admin Login</h1>
            <p className="text-muted-foreground">Sign in to access admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Need a different role?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                General Login
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Inspector?{" "}
              <Link to="/inspector/login" className="text-primary hover:underline font-medium">
                Inspector Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 hero-section items-center justify-center p-12 bg-primary/5">
        <div className="max-w-md text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl font-semibold mb-4">
            Admin Portal
          </h2>
          <p className="text-muted-foreground">
            Manage auctions, products, and platform operations from a centralized dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

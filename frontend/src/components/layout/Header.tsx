import { Search, Menu, User, LogOut, Bell, LayoutDashboard, ShoppingBag, Shield, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

// Role-based navigation configuration
const getRoleNavigation = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return {
        dashboardPath: '/admin/dashboard',
        dashboardLabel: 'Admin Dashboard',
        dashboardIcon: Shield,
      };
    case 'AUCTIONEER':
      return {
        dashboardPath: '/seller/dashboard',
        dashboardLabel: 'Seller Dashboard',
        dashboardIcon: ShoppingBag,
      };
    case 'INSPECTOR':
      return {
        dashboardPath: '/admin/dashboard',
        dashboardLabel: 'Inspector Dashboard',
        dashboardIcon: ClipboardCheck,
      };
    default:
      return null;
  }
};

const categories = [
  "Archeology",
  "Art",
  "Books & Comics",
  "Ancient Vehicles",
  "Coins & Bars",
  "Sport & Entertainment",
  "Fashion",
  "Watches",
];

interface HeaderProps {
  simplified?: boolean;
}

const Header = ({ simplified = false }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Get role-based navigation
  const roleNav = user ? getRoleNavigation(user.role) : null;
  const DashboardIcon = roleNav?.dashboardIcon || LayoutDashboard;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="container flex h-10 items-center justify-between">
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/how-it-works" className="hover:text-foreground transition-colors">
              How it works?
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                  {/* Badge for unread notifications */}
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
                </Button>
              </Link>
            )}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:inline">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name || user.email}</span>
                      <span className="text-xs font-normal text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roleNav && (
                    <DropdownMenuItem asChild>
                      <Link to={roleNav.dashboardPath} className="cursor-pointer">
                        <DashboardIcon className="mr-2 h-4 w-4" />
                        {roleNav.dashboardLabel}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="outline">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-16" />
          </Link>

          {/* Search - hidden in simplified mode */}
          {!simplified && (
            <div className="hidden md:flex relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find item or seller..."
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
          )}
        </div>

        {/* Mobile menu - hidden in simplified mode */}
        {!simplified && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Find item or seller..."
                    className="pl-10"
                  />
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Categories</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${cat.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                      className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        )}

        {/* Desktop nav - hidden in simplified mode */}
        {!simplified && (
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/auctions">
              <Button variant="ghost" size="sm">All Auctions</Button>
            </Link>
            <Link to="/sell">
              <Button size="sm">Sell Item</Button>
            </Link>
          </nav>
        )}
      </div>

      {/* Category bar - hidden in simplified mode */}
      {!simplified && (
        <div className="border-t border-border overflow-x-auto hidden md:block">
          <div className="container">
            <nav className="flex items-center gap-6 h-12 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  className="whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

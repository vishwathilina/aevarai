import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, Bell, LogOut, Camera, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { profileApi, Profile } from "@/api/profile";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await profileApi.get();
        setUser(profileData);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load profile");
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const updatedProfile = await profileApi.update({
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        location: user.location || undefined,
      });
      setUser(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload profile data to reset changes
    profileApi.get().then(setUser).catch(console.error);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load profile</p>
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
          {/* Profile Header */}
          <div className="bg-card rounded-xl border p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-3xl font-semibold">
                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user.name[0]?.toUpperCase() || "U"}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h1 className="font-serif text-2xl font-semibold mb-1">{user.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {user.joinedDate}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold font-serif">{user.stats.bidsPlaced}</p>
                <p className="text-sm text-muted-foreground">Bids Placed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-serif">{user.stats.auctionsWon}</p>
                <p className="text-sm text-muted-foreground">Auctions Won</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-serif">{user.stats.itemsSold}</p>
                <p className="text-sm text-muted-foreground">Items Sold</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList>
              <TabsTrigger value="account">Account Details</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Personal Information</h2>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={user.phone || ""}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={user.location || ""}
                    onChange={(e) => setUser({ ...user, location: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="addresses" className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Saved Addresses</h2>
                <Button size="sm">Add Address</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Home</p>
                    <p className="text-sm text-muted-foreground">
                      Jan Kowalski<br />
                      03-407 Warsaw, Rodzinna 14<br />
                      Poland
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Payment Methods</h2>
                <Button size="sm">Add Payment Method</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-mono">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Link to="/my-bids" className="bg-card rounded-xl border p-6 hover:border-primary transition-colors">
              <h3 className="font-semibold mb-1">My Bids</h3>
              <p className="text-sm text-muted-foreground">View all your active and past bids</p>
            </Link>
            <Link to="/won-auctions" className="bg-card rounded-xl border p-6 hover:border-primary transition-colors">
              <h3 className="font-semibold mb-1">Won Auctions</h3>
              <p className="text-sm text-muted-foreground">Manage your winning purchases</p>
            </Link>
            <Link to="/seller/dashboard" className="bg-card rounded-xl border p-6 hover:border-primary transition-colors">
              <h3 className="font-semibold mb-1">Seller Dashboard</h3>
              <p className="text-sm text-muted-foreground">Manage your listings and sales</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

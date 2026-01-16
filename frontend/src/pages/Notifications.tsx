import { Bell, Check, Gavel, Package, AlertCircle, Heart, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { notificationsApi, Notification } from "@/api/notifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, { icon: any; color: string }> = {
  outbid: { icon: AlertCircle, color: "text-destructive" },
  won: { icon: Gavel, color: "text-bid-success" },
  shipped: { icon: Package, color: "text-primary" },
  ending: { icon: Bell, color: "text-bid-warning" },
  watchlist: { icon: Heart, color: "text-primary" },
  "Document Review Approved": { icon: Check, color: "text-bid-success" },
  "Document Review Rejected": { icon: AlertCircle, color: "text-destructive" },
  "Physical Inspection Approved": { icon: Check, color: "text-bid-success" },
  "Physical Inspection Rejected": { icon: AlertCircle, color: "text-destructive" },
  "Auction Scheduled": { icon: Bell, color: "text-primary" },
  "Auction Now Live!": { icon: Gavel, color: "text-primary" },
  "🎉 You Won the Auction!": { icon: Gavel, color: "text-bid-success" },
};

const getNotificationType = (title: string): string => {
  if (title.includes("won") || title.includes("Won")) return "won";
  if (title.includes("outbid") || title.includes("Outbid")) return "outbid";
  if (title.includes("shipped") || title.includes("Shipped")) return "shipped";
  if (title.includes("ending") || title.includes("Ending")) return "ending";
  if (title.includes("watchlist") || title.includes("Watchlist")) return "watchlist";
  return "default";
};

const getActionUrl = (notification: Notification): string => {
  const title = notification.title.toLowerCase();
  const message = notification.message.toLowerCase();
  
  if (title.includes("won") || title.includes("🎉")) {
    // Extract auction ID from message if possible
    const auctionMatch = notification.message.match(/auction id:?\s*(\d+)/i);
    if (auctionMatch) {
      return `/checkout/${auctionMatch[1]}`;
    }
    return "/won-auctions";
  }
  
  if (title.includes("outbid")) {
    // Try to extract auction ID from message
    const auctionMatch = notification.message.match(/auction #?(\d+)/i);
    if (auctionMatch) {
      return `/auction/${auctionMatch[1]}`;
    }
    return "/auctions";
  }
  
  if (title.includes("shipped") || title.includes("delivery")) {
    return "/won-auctions";
  }
  
  if (title.includes("document") || title.includes("inspection")) {
    return "/seller/products";
  }
  
  if (title.includes("auction") && title.includes("live")) {
    const auctionMatch = notification.message.match(/auction id:?\s*(\d+)/i);
    if (auctionMatch) {
      return `/auction/${auctionMatch[1]}`;
    }
    return "/auctions";
  }
  
  return "/auctions";
};

const Notifications = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? notificationsApi.getAll(user.id) : Promise.resolve([]),
    enabled: !!user?.id && isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error: any) => {
      toast.error("Failed to mark notification as read");
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => user?.id ? notificationsApi.markAllAsRead(user.id) : Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  const handleViewDetails = (notification: Notification) => {
    markAsReadMutation.mutate(notification.id);
    const url = getActionUrl(notification);
    navigate(url);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Please login to view notifications</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isLoading}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notification) => {
              const notificationType = getNotificationType(notification.title);
              const { icon: Icon, color } = iconMap[notificationType] || { icon: Bell, color: "text-muted-foreground" };
              const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
              
              return (
                <div
                  key={notification.id}
                  className={`bg-card rounded-xl border p-4 transition-colors ${
                    !notification.isRead ? "border-primary/30 bg-accent/30" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Badge className="bg-primary text-primary-foreground">New</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(notification)}
                        >
                          View Details
                        </Button>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isLoading}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="text-center py-16 bg-card rounded-xl border">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-semibold mb-1">No notifications</h2>
                <p className="text-muted-foreground">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;

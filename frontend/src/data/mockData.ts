import { AuctionItem } from "@/components/auction/AuctionCard";
import { Category } from "@/components/auction/CategoryCard";

export const categories: Category[] = [
  { id: "archeology", name: "Archeology", image: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=200&q=80", count: 45 },
  { id: "art", name: "Art", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&q=80", count: 128 },
  { id: "books-comics", name: "Books & Comics", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80", count: 256 },
  { id: "ancient-vehicles", name: "Ancient Vehicles", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200&q=80", count: 34 },
  { id: "coins-bars", name: "Coins & Bars", image: "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=200&q=80", count: 89 },
  { id: "watches", name: "Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80", count: 167 },
  { id: "fashion", name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80", count: 203 },
  { id: "stamps", name: "Stamps", image: "https://images.unsplash.com/photo-1584727638753-d0fa6be43a95?w=200&q=80", count: 312 },
];

export const featuredAuctions: AuctionItem[] = [
  {
    id: "1",
    title: "Kawasaki Bayou 220 - Classic ATV in Excellent Condition",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    category: "Vehicles",
    currentBid: 1276,
    currency: "USD",
    timeRemaining: "2d 1h",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Italian Renaissance Bronze Sculpture - 16th Century",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80",
    category: "Art",
    currentBid: 4970,
    currency: "USD",
    timeRemaining: "5d 12h",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Rolex Submariner Date - 1985 Vintage",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80",
    category: "Watches",
    currentBid: 12500,
    currency: "USD",
    timeRemaining: "1d 6h",
    isUrgent: true,
    isFeatured: true,
  },
  {
    id: "4",
    title: "First Edition - The Great Gatsby 1925",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    category: "Books & Comics",
    currentBid: 8450,
    currency: "USD",
    timeRemaining: "3d 8h",
  },
  {
    id: "5",
    title: "1967 Ford Mustang Shelby GT500 - Fully Restored",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
    category: "Ancient Vehicles",
    currentBid: 125000,
    currency: "USD",
    timeRemaining: "7d 2h",
  },
  {
    id: "6",
    title: "Ancient Roman Gold Aureus - Emperor Augustus",
    image: "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=600&q=80",
    category: "Coins & Bars",
    currentBid: 18750,
    currency: "USD",
    timeRemaining: "4d 16h",
  },
];

export const liveAuctions: AuctionItem[] = [
  ...featuredAuctions,
  {
    id: "7",
    title: "Victorian Era Diamond Necklace - 18K Gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    category: "Fashion",
    currentBid: 34200,
    currency: "USD",
    timeRemaining: "2h 45m",
    isUrgent: true,
  },
  {
    id: "8",
    title: "Rare Penny Black Stamp Collection - 1840",
    image: "https://images.unsplash.com/photo-1584727638753-d0fa6be43a95?w=600&q=80",
    category: "Stamps",
    currentBid: 5680,
    currency: "USD",
    timeRemaining: "6d 4h",
  },
  {
    id: "9",
    title: "Egyptian Canopic Jar - Late Period",
    image: "https://images.unsplash.com/photo-1608376630927-61c29a4f1dc0?w=600&q=80",
    category: "Archeology",
    currentBid: 15900,
    currency: "USD",
    timeRemaining: "5d 18h",
  },
];

export const auctionDetail = {
  id: "3",
  title: "Rolex Submariner Date - 1985 Vintage",
  description: `This exceptional Rolex Submariner Date from 1985 represents one of the most sought-after vintage dive watches in the world. The watch features the iconic black dial with luminous hour markers and hands, a unidirectional rotating bezel, and the reliable Rolex Caliber 3035 automatic movement.

**Condition:** Excellent, with original patina
**Case:** 40mm stainless steel
**Movement:** Automatic, Caliber 3035
**Bracelet:** Original Oyster bracelet with 93150 clasp
**Box & Papers:** Original box, papers, and service records included

This watch has been serviced and authenticated by a certified Rolex dealer. The tritium dial and hands have developed a beautiful cream patina, adding to its vintage appeal.`,
  images: [
    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
  ],
  category: "Watches",
  currentBid: 12500,
  currency: "USD",
  minIncrement: 250,
  startingPrice: 8000,
  endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
  bidCount: 23,
  watcherCount: 156,
  seller: {
    name: "VintageTimepieces",
    rating: 4.9,
    reviews: 342,
    verified: true,
  },
  bidHistory: [
    { bidder: "watch_collector_88", amount: 12500, time: "2 mins ago" },
    { bidder: "timeless_finds", amount: 12250, time: "15 mins ago" },
    { bidder: "vintage_lover", amount: 12000, time: "1 hour ago" },
    { bidder: "watch_collector_88", amount: 11500, time: "2 hours ago" },
    { bidder: "luxury_items", amount: 11000, time: "3 hours ago" },
  ],
};

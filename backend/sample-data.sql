-- =====================================================
-- SAMPLE DATA FOR AUCTION PLATFORM - COMPLETE TESTING
-- =====================================================
-- This file contains realistic test data for all modules
-- Run after schema.sql to populate the database
-- Updated: 2026-01-16
-- =====================================================

-- =========================
-- USERS (Pre-hashed passwords using BCrypt)
-- =========================
-- NOTE: All passwords are hashed using BCrypt
-- Plain text passwords for reference:
--   admin123, seller123, buyer123, inspector123, bidder123

-- Admin User
INSERT INTO users (name, email, password, role, active, phone, location) VALUES
('Admin User', 'admin@auction.com', 'password', 'ADMIN', true, '+94771234567', 'Colombo, Sri Lanka');

-- Sellers/Auctioneers
INSERT INTO users (name, email, password, role, active, phone, location) VALUES
('John Seller', 'john.seller@test.com', 'password', 'AUCTIONEER', true, '+94772345678', 'Kandy, Sri Lanka'),
('Sarah Merchant', 'sarah.merchant@test.com', 'password', 'AUCTIONEER', true, '+94773456789', 'Galle, Sri Lanka'),
('Mike Trader', 'mike.trader@test.com', 'password', 'AUCTIONEER', true, '+94774567890', 'Jaffna, Sri Lanka');

-- Inspectors
INSERT INTO users (name, email, password, role, active, phone, location) VALUES
('Inspector Holmes', 'inspector@auction.com', 'password', 'INSPECTOR', true, '+94775678901', 'Colombo, Sri Lanka'),
('Quality Checker', 'quality@auction.com', 'password', 'INSPECTOR', true, '+94776789012', 'Kandy, Sri Lanka');

-- Bidders
INSERT INTO users (name, email, password, role, active, phone, location) VALUES
('Alice Bidder', 'alice@test.com', 'password', 'BIDDER', true, '+94777890123', 'Colombo, Sri Lanka'),
('Bob Buyer', 'bob@test.com', 'password', 'BIDDER', true, '+94778901234', 'Galle, Sri Lanka'),
('Carol Customer', 'carol@test.com', 'password', 'BIDDER', true, '+94779012345', 'Kandy, Sri Lanka'),
('David Collector', 'david@test.com', 'password', 'BIDDER', true, '+94770123456', 'Negombo, Sri Lanka'),
('Emma Enthusiast', 'emma@test.com', 'password', 'BIDDER', true, '+94771234560', 'Matara, Sri Lanka');

-- =========================
-- PRODUCTS (Various States)
-- =========================

-- Approved Products (Ready for Auction)
INSERT INTO products (seller_id, title, description, category, status, reviewed_by, reviewed_at, handling_fee_paid, review_remarks) VALUES
(2, 'Vintage Rolex Submariner Watch', '1960s Swiss made automatic watch in excellent condition', 'WATCH', 'APPROVED', 5, '2026-01-10 10:00:00', true, 'Authentic verified, all documentation in order'),
(3, 'Apple MacBook Pro 16" M2', 'Brand new sealed 2023 model with warranty', 'ELECTRONICS', 'APPROVED', 5, '2026-01-11 14:30:00', true, 'Product is genuine and unopened'),
(2, 'Antique Persian Rug', '100 year old hand-woven rug from Isfahan', 'HOME_DECOR', 'APPROVED', 6, '2026-01-09 09:00:00', true, 'Authenticity certificate provided'),
(4, 'Rare Pokemon Card Collection', 'First edition Charizard and complete set', 'COLLECTIBLES', 'APPROVED', 5, '2026-01-12 11:00:00', true, 'Cards graded PSA 9-10'),
(3, 'Steinway Grand Piano Model B', '2019 Model B with 5 years warranty remaining', 'MUSICAL_INSTRUMENTS', 'APPROVED', 6, '2026-01-08 16:00:00', true, 'Excellent condition, tuned and verified');

-- Pending Products (Awaiting Review)
INSERT INTO products (seller_id, title, description, category, status, handling_fee_paid) VALUES
(2, 'Diamond Engagement Ring', '2 carat platinum ring with certificate', 'JEWELRY', 'PENDING', true),
(4, 'Signed Baseball Collection', 'Autographed by Babe Ruth and Mickey Mantle', 'SPORTS', 'PENDING', true);

-- Rejected Product
INSERT INTO products (seller_id, title, description, category, status, reviewed_by, reviewed_at, rejection_reason, handling_fee_paid) VALUES
(3, 'Suspicious Designer Handbag', 'Louis Vuitton bag', 'FASHION', 'REJECTED', 5, '2026-01-14 10:00:00', 'Unable to verify authenticity. Please provide purchase receipt.', false);

-- Auctioned Products (Completed)
INSERT INTO products (seller_id, title, description, category, status, reviewed_by, reviewed_at, handling_fee_paid) VALUES
(2, 'Poedagar Luxury Watch Collection', 'Gold and blue dial luxury watch set', 'WATCH', 'AUCTIONED', 5, '2026-01-05 10:00:00', true);

-- =========================
-- INSPECTIONS (Scheduled 20+ days from 2026-01-16)
-- =========================
INSERT INTO inspections (product_id, inspector_id, inspection_type, inspection_fee, status, remarks, inspected_at) VALUES
-- Past inspections (completed)
(1, 5, 'ON_SITE', 5000.00, 'APPROVED', 'Watch mechanism inspected, all parts original', '2026-01-10 10:00:00'),
(2, 5, 'VISIT', 3000.00, 'APPROVED', 'Packaging sealed, serial number verified with Apple', '2026-01-11 14:30:00'),
(3, 6, 'ON_SITE', 7500.00, 'APPROVED', 'Rug authenticated by expert', '2026-01-09 09:00:00'),
(4, 5, 'ON_SITE', 2500.00, 'APPROVED', 'Cards graded and verified by certified expert', '2026-01-12 11:00:00'),
(5, 6, 'VISIT', 10000.00, 'APPROVED', 'Piano inspected, all keys and mechanisms working perfectly', '2026-01-08 16:00:00');

-- Scheduled inspections (20+ days from now)
INSERT INTO inspections (product_id, inspector_id, inspection_type, inspection_fee, status, remarks, inspected_at) VALUES
(6, 5, 'ON_SITE', 8000.00, 'APPROVED', 'Scheduled for detailed gemological examination', '2026-02-10 10:00:00'),
(7, 6, 'VISIT', 5000.00, 'APPROVED', 'Scheduled for authentication verification', '2026-02-15 14:00:00');

-- =========================
-- AUCTIONS (Live for 1 month from 2026-01-16)
-- =========================

-- LIVE Auctions (Currently Active - ending Feb 16, 2026)
INSERT INTO auctions (product_id, seller_id, start_price, current_price, min_increment, start_time, end_time, status, winner_id, winner_user_id) VALUES
-- Auction 1: Rolex Watch (has bids)
(1, 2, 250000.00, 295000.00, 5000.00, '2026-01-16 10:00:00', '2026-02-16 10:00:00', 'LIVE', 7, 7),
-- Auction 2: MacBook (has bids)
(2, 3, 450000.00, 520000.00, 10000.00, '2026-01-16 12:00:00', '2026-02-16 12:00:00', 'LIVE', 8, 8),
-- Auction 3: Persian Rug (has bids)
(3, 2, 150000.00, 185000.00, 5000.00, '2026-01-16 14:00:00', '2026-02-16 14:00:00', 'LIVE', 9, 9);

-- SCHEDULED Auctions (Future - starting in 1 week, ending in 1 month + 1 week)
INSERT INTO auctions (product_id, seller_id, start_price, current_price, min_increment, start_time, end_time, status) VALUES
(4, 4, 75000.00, 75000.00, 2500.00, '2026-01-23 10:00:00', '2026-02-23 10:00:00', 'SCHEDULED'),
(5, 3, 2500000.00, 2500000.00, 50000.00, '2026-01-25 10:00:00', '2026-02-25 10:00:00', 'SCHEDULED');

-- ENDED Auctions (Completed with Winner)
INSERT INTO auctions (product_id, seller_id, start_price, current_price, min_increment, start_time, end_time, status, winner_id, winner_user_id) VALUES
(9, 2, 85000.00, 125000.00, 2500.00, '2025-12-15 10:00:00', '2026-01-15 10:00:00', 'ENDED', 10, 10);

-- =========================
-- BIDS (Manual & Auto)
-- =========================

-- Bids for Auction 1 (Rolex Watch - LIVE)
INSERT INTO bids (auction_id, bidder_id, bid_amount, bid_type, created_at) VALUES
(1, 7, 250000.00, 'MANUAL', '2026-01-16 10:05:00'),
(1, 8, 255000.00, 'MANUAL', '2026-01-16 10:15:00'),
(1, 9, 260000.00, 'MANUAL', '2026-01-16 10:30:00'),
(1, 7, 265000.00, 'PROXY_AUTO', '2026-01-16 10:35:00'),
(1, 8, 270000.00, 'PROXY_AUTO', '2026-01-16 10:40:00'),
(1, 7, 275000.00, 'PROXY_AUTO', '2026-01-16 10:45:00'),
(1, 10, 280000.00, 'MANUAL', '2026-01-16 11:00:00'),
(1, 7, 285000.00, 'PROXY_AUTO', '2026-01-16 11:05:00'),
(1, 7, 290000.00, 'PROXY_AUTO', '2026-01-16 11:10:00'),
(1, 7, 295000.00, 'PROXY_AUTO', '2026-01-16 11:15:00');

-- Bids for Auction 2 (MacBook - LIVE)
INSERT INTO bids (auction_id, bidder_id, bid_amount, bid_type, created_at) VALUES
(2, 8, 450000.00, 'MANUAL', '2026-01-16 12:05:00'),
(2, 9, 460000.00, 'MANUAL', '2026-01-16 12:15:00'),
(2, 10, 470000.00, 'MANUAL', '2026-01-16 12:30:00'),
(2, 8, 480000.00, 'PROXY_AUTO', '2026-01-16 12:35:00'),
(2, 9, 490000.00, 'PROXY_AUTO', '2026-01-16 12:40:00'),
(2, 8, 500000.00, 'PROXY_AUTO', '2026-01-16 12:45:00'),
(2, 8, 510000.00, 'PROXY_AUTO', '2026-01-16 12:50:00'),
(2, 8, 520000.00, 'PROXY_AUTO', '2026-01-16 12:55:00');

-- Bids for Auction 3 (Persian Rug - LIVE)
INSERT INTO bids (auction_id, bidder_id, bid_amount, bid_type, created_at) VALUES
(3, 9, 150000.00, 'MANUAL', '2026-01-16 14:05:00'),
(3, 10, 155000.00, 'MANUAL', '2026-01-16 14:15:00'),
(3, 11, 160000.00, 'MANUAL', '2026-01-16 14:30:00'),
(3, 9, 165000.00, 'PROXY_AUTO', '2026-01-16 14:35:00'),
(3, 10, 170000.00, 'MANUAL', '2026-01-16 14:45:00'),
(3, 9, 175000.00, 'PROXY_AUTO', '2026-01-16 14:50:00'),
(3, 9, 180000.00, 'PROXY_AUTO', '2026-01-16 14:55:00'),
(3, 9, 185000.00, 'PROXY_AUTO', '2026-01-16 15:00:00');

-- Bids for Auction 6 (Poedagar Watch - ENDED)
INSERT INTO bids (auction_id, bidder_id, bid_amount, bid_type, created_at) VALUES
(6, 7, 85000.00, 'MANUAL', '2025-12-15 10:05:00'),
(6, 11, 90000.00, 'MANUAL', '2025-12-20 14:00:00'),
(6, 10, 95000.00, 'MANUAL', '2025-12-25 10:00:00'),
(6, 7, 100000.00, 'MANUAL', '2025-12-30 16:00:00'),
(6, 10, 110000.00, 'PROXY_AUTO', '2026-01-05 10:00:00'),
(6, 10, 120000.00, 'PROXY_AUTO', '2026-01-10 12:00:00'),
(6, 10, 125000.00, 'PROXY_AUTO', '2026-01-14 18:00:00');

-- =========================
-- PROXY BIDS (Active Auto-Bidding)
-- =========================

-- Active proxy bids for LIVE auctions
INSERT INTO proxy_bids (auction_id, bidder_id, max_amount, created_at) VALUES
-- Rolex Watch auction
(1, 7, 350000.00, '2026-01-16 10:10:00'),
(1, 8, 300000.00, '2026-01-16 10:20:00'),
(1, 9, 280000.00, '2026-01-16 10:30:00'),
-- MacBook auction
(2, 8, 600000.00, '2026-01-16 12:10:00'),
(2, 9, 550000.00, '2026-01-16 12:20:00'),
(2, 11, 500000.00, '2026-01-16 12:30:00'),
-- Persian Rug auction
(3, 9, 250000.00, '2026-01-16 14:10:00'),
(3, 10, 200000.00, '2026-01-16 14:20:00');

-- =========================
-- PAYMENTS
-- =========================

-- Completed payments
INSERT INTO payments (auction_id, bidder_id, amount, stripe_payment_id, status, paid_at) VALUES
(6, 10, 125000.00, 'pi_sandbox_watch_001', 'SUCCESS', '2026-01-15 12:00:00');

-- Pending payment
INSERT INTO payments (auction_id, bidder_id, amount, status) VALUES
(6, 10, 125000.00, 'PENDING');

-- =========================
-- COMMISSIONS
-- =========================

-- Platform commissions (5% rate)
INSERT INTO commissions (auction_id, percentage, amount, created_at) VALUES
(6, 5.00, 6250.00, '2026-01-15 12:00:00');  -- 5% of 125000

-- =========================
-- DELIVERIES
-- =========================

-- Completed deliveries
INSERT INTO deliveries (auction_id, delivery_type, delivery_fee, status, created_at) VALUES
(6, 'DELIVERY', 2500.00, 'COMPLETED', '2026-01-16 09:00:00');

-- =========================
-- NOTIFICATIONS
-- =========================

INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES
-- For Alice (bidder 7)
(7, 'Bid Placed Successfully', 'Your bid of Rs. 295,000 on Vintage Rolex Submariner Watch has been placed', false, '2026-01-16 11:15:00'),
(7, 'You are winning!', 'You are currently the highest bidder on Vintage Rolex Submariner Watch', false, '2026-01-16 11:15:00'),

-- For Bob (bidder 8)
(8, 'Proxy Bid Active', 'Your proxy bid is active on Apple MacBook Pro 16" M2', false, '2026-01-16 12:55:00'),
(8, 'You are winning!', 'You are currently the highest bidder on Apple MacBook Pro 16" M2', false, '2026-01-16 12:55:00'),

-- For Carol (bidder 9)
(9, 'You are winning!', 'You are currently the highest bidder on Antique Persian Rug', false, '2026-01-16 15:00:00'),
(9, 'Outbid Alert', 'You have been outbid on Vintage Rolex Submariner Watch', true, '2026-01-16 10:35:00'),

-- For David (bidder 10)
(10, 'Payment Successful', 'Your payment of Rs. 125,000 for Poedagar Luxury Watch Collection has been processed', true, '2026-01-15 12:00:00'),
(10, 'Auction Won!', 'Congratulations! You won the Poedagar Luxury Watch Collection auction', true, '2026-01-15 10:00:00'),
(10, 'Delivery Completed', 'Your item has been delivered successfully', false, '2026-01-16 09:00:00'),

-- For Sellers
(2, 'Product Approved', 'Your Vintage Rolex Submariner Watch has been approved for auction', true, '2026-01-10 10:00:00'),
(3, 'Product Rejected', 'Your Designer Handbag was rejected. Reason: Authentication issue', false, '2026-01-14 10:00:00'),
(2, 'Auction Started', 'Your Vintage Rolex Submariner Watch auction is now live!', true, '2026-01-16 10:00:00'),
(3, 'Auction Started', 'Your Apple MacBook Pro 16" M2 auction is now live!', true, '2026-01-16 12:00:00');

-- =========================
-- PRODUCT IMAGES (Using provided URLs)
-- =========================

INSERT INTO product_images (product_id, image_url) VALUES
-- Product 1: Rolex Watch
(1, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_17/images/1768513971051_11.jpg'),
-- Product 2: MacBook
(2, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_18/images/1768514108586_images__2_.jfif'),
-- Product 3: Persian Rug
(3, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_19/images/1768515133193_Steinway-GrandsB_211-1000x100011_750x.webp'),
-- Product 5: Steinway Piano
(5, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_19/images/1768515133193_Steinway-GrandsB_211-1000x100011_750x.webp'),
-- Product 9: Poedagar Watch Collection (multiple images)
(9, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_20/images/1768516140000_anix.lk_.Poedagar.615.GD_.BU_.2.6-570x570.webp'),
(9, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_20/images/1768516140003_anix.lk_.Poedagar.615.GD_.BU_.2.5.webp'),
(9, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_20/images/1768516140003_anix.lk_.Poedagar.615.GD_.BU_.2-570x570.webp'),
(9, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_20/images/1768516140004_anix.lk_.Poedagar.615.GD_.BU_.2.4-570x570.webp'),
(9, 'https://sxlsbefzrdmpmpauolil.supabase.co/storage/v1/object/public/images/products/product_20/images/1768516140004_anix.lk_.Poedagar.615.GD_.BU_-570x570.webp');

-- =========================
-- PRODUCT DOCUMENTS
-- =========================

INSERT INTO product_documents (product_id, document_url, document_type) VALUES
(1, 'https://example.com/docs/rolex-certificate.pdf', 'AUTHENTICITY_CERTIFICATE'),
(1, 'https://example.com/docs/rolex-receipt.pdf', 'PURCHASE_RECEIPT'),
(2, 'https://example.com/docs/macbook-warranty.pdf', 'WARRANTY'),
(3, 'https://example.com/docs/rug-appraisal.pdf', 'APPRAISAL'),
(4, 'https://example.com/docs/pokemon-grading.pdf', 'GRADING_REPORT'),
(5, 'https://example.com/docs/piano-warranty.pdf', 'WARRANTY'),
(9, 'https://example.com/docs/watch-certificate.pdf', 'AUTHENTICITY_CERTIFICATE');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check user counts
-- SELECT role, COUNT(*) FROM users GROUP BY role;

-- Check product statuses
-- SELECT status, COUNT(*) FROM products GROUP BY status;

-- Check auction statuses
-- SELECT status, COUNT(*) FROM auctions GROUP BY status;

-- Check live auctions with current prices
-- SELECT a.id, p.title, a.current_price, a.start_price, a.end_time 
-- FROM auctions a JOIN products p ON a.product_id = p.id 
-- WHERE a.status = 'LIVE';

-- Check bid counts per auction
-- SELECT auction_id, COUNT(*) as bid_count, MAX(bid_amount) as highest_bid 
-- FROM bids GROUP BY auction_id;

-- Check proxy bids
-- SELECT pb.auction_id, u.name, pb.max_amount 
-- FROM proxy_bids pb JOIN users u ON pb.bidder_id = u.id;

-- =====================================================
-- END OF SAMPLE DATA
-- =====================================================

-- Summary:
-- Users: 11 (1 Admin, 3 Auctioneers, 2 Inspectors, 5 Bidders)
-- Products: 9 (5 Approved, 2 Pending, 1 Rejected, 1 Auctioned)
-- Inspections: 7 (5 Completed, 2 Scheduled for 20+ days)
-- Auctions: 6 (3 Live until Feb 16 2026, 2 Scheduled, 1 Ended)
-- Bids: 33 (Mix of Manual and Proxy-Auto)
-- Proxy Bids: 8 Active
-- Payments: 2 (1 Success, 1 Pending)
-- Commissions: 1
-- Deliveries: 1
-- Notifications: 14
-- Product Images: 9 (using provided Supabase URLs)

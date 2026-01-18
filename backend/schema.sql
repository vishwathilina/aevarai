-- =====================================================
-- FINAL DATABASE SCHEMA SCRIPT
-- Auction Platform - Complete Schema
-- =====================================================

-- Create Schema
CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION pg_database_owner;
COMMENT ON SCHEMA public IS 'standard public schema';

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(255) NOT NULL, -- ADMIN, SELLER, BIDDER, INSPECTOR
    active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(255),
    status VARCHAR(255) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    rejection_reason VARCHAR(255),
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    handling_fee_paid BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    review_remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6),
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT fk_product_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- =========================
-- PRODUCT DOCUMENTS
-- =========================
CREATE TABLE product_documents (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    document_url TEXT NOT NULL,
    document_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- PRODUCT IMAGES
-- =========================
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- INSPECTIONS
-- =========================
CREATE TABLE inspections (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    inspector_id BIGINT NOT NULL,
    inspection_type VARCHAR(50), -- ON_SITE, VISIT
    inspection_fee NUMERIC(10,2),
    status VARCHAR(30), -- APPROVED, REJECTED
    remarks TEXT,
    inspected_at TIMESTAMP,
    CONSTRAINT fk_inspection_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_inspection_inspector FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- =========================
-- AUCTIONS
-- =========================
CREATE TABLE auctions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    start_price FLOAT8 NOT NULL,
    current_price FLOAT8,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(255) DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, ENDED
    winner_id BIGINT,
    min_increment FLOAT8,
    seller_id BIGINT,
    winner_user_id BIGINT,
    CONSTRAINT fk_auction_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_auction_winner FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- =========================
-- BIDS (MANUAL BIDS)
-- =========================
CREATE TABLE bids (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder_id BIGINT NOT NULL,
    bid_amount NUMERIC(10,2) NOT NULL,
    bid_type VARCHAR(20) DEFAULT 'MANUAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bid_auction FOREIGN KEY (auction_id) REFERENCES auctions(id),
    CONSTRAINT fk_bid_user FOREIGN KEY (bidder_id) REFERENCES users(id)
);

-- =========================
-- PROXY BIDS (AUTO BIDDING)
-- =========================
CREATE TABLE proxy_bids (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder_id BIGINT NOT NULL,
    max_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proxy_auction FOREIGN KEY (auction_id) REFERENCES auctions(id),
    CONSTRAINT fk_proxy_user FOREIGN KEY (bidder_id) REFERENCES users(id),
    CONSTRAINT unique_proxy_bid UNIQUE (auction_id, bidder_id)
);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder_id BIGINT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    stripe_payment_id TEXT,
    status VARCHAR(30), -- PENDING, SUCCESS, FAILED
    paid_at TIMESTAMP,
    CONSTRAINT fk_payment_auction FOREIGN KEY (auction_id) REFERENCES auctions(id),
    CONSTRAINT fk_payment_user FOREIGN KEY (bidder_id) REFERENCES users(id)
);

-- =========================
-- DELIVERY
-- =========================
CREATE TABLE deliveries (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT UNIQUE NOT NULL,
    delivery_type VARCHAR(30), -- PICKUP, DELIVERY
    delivery_fee NUMERIC(10,2),
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, COMPLETED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_auction FOREIGN KEY (auction_id) REFERENCES auctions(id)
);

-- =========================
-- COMMISSIONS
-- =========================
CREATE TABLE commissions (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT UNIQUE NOT NULL,
    percentage NUMERIC(5,2),
    amount NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_commission_auction FOREIGN KEY (auction_id) REFERENCES auctions(id)
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_reviewed_by ON products(reviewed_by);

CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_product_id ON auctions(product_id);
CREATE INDEX idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX idx_auctions_start_time ON auctions(start_time);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);

CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_created_at ON bids(created_at);

CREATE INDEX idx_proxy_bids_auction_id ON proxy_bids(auction_id);
CREATE INDEX idx_proxy_bids_bidder_id ON proxy_bids(bidder_id);

CREATE INDEX idx_payments_auction_id ON payments(auction_id);
CREATE INDEX idx_payments_bidder_id ON payments(bidder_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_inspections_product_id ON inspections(product_id);
CREATE INDEX idx_inspections_inspector_id ON inspections(inspector_id);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_documents_product_id ON product_documents(product_id);

-- =====================================================
-- COMMENTS ON TABLES
-- =====================================================
COMMENT ON TABLE users IS 'Stores all users including admins, sellers, bidders, and inspectors';
COMMENT ON TABLE products IS 'Products listed by sellers for auction';
COMMENT ON TABLE auctions IS 'Active and completed auctions';
COMMENT ON TABLE bids IS 'Manual bids placed by bidders';
COMMENT ON TABLE proxy_bids IS 'Automatic bidding with maximum amounts';
COMMENT ON TABLE payments IS 'Payment records for completed auctions';
COMMENT ON TABLE deliveries IS 'Delivery information for won auctions';
COMMENT ON TABLE commissions IS 'Platform commission for each auction';
COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON TABLE inspections IS 'Product inspection records';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
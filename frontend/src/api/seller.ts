import apiClient from './config';

// ========================
// Types
// ========================

export interface SellerDashboardStats {
    totalProducts: number;
    totalAuctions: number;
    activeAuctions: number;
    soldProducts: number;
    totalSalesAmount: number;
}

export interface SellerProduct {
    productId: number;
    title: string;
    description: string;
    category: string;
    status: string;
    rejectionReason?: string;
    reviewRemarks?: string;
    handlingFeePaid: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SellerAuction {
    auctionId: number;
    productId: number;
    productTitle: string;
    startTime: string;
    endTime: string;
    startPrice: number;
    currentPrice: number;
    minIncrement: number;
    status: string;
    totalBids: number;
}

export interface Sale {
    auctionId: number;
    productId: number;
    productName: string;
    finalPrice: number;
    winnerId: number;
    winnerName: string;
    winnerEmail: string;
    auctionEndDate: string;
    paymentStatus: string;
}

export interface ProductUpdateRequest {
    title?: string;
    description?: string;
    category?: string;
}

// ========================
// API Functions
// ========================

export const sellerApi = {
    /**
     * Get dashboard statistics for the authenticated seller
     */
    async getDashboardStats(): Promise<SellerDashboardStats> {
        const response = await apiClient.get<SellerDashboardStats>('/seller/dashboard');
        return response.data;
    },

    /**
     * Get all products for the authenticated seller
     */
    async getProducts(): Promise<SellerProduct[]> {
        const response = await apiClient.get<SellerProduct[]>('/seller/products');
        return response.data;
    },

    /**
     * Update a product (only if PENDING or REJECTED)
     */
    async updateProduct(productId: number, data: ProductUpdateRequest): Promise<SellerProduct> {
        const response = await apiClient.put<SellerProduct>(`/seller/products/${productId}`, data);
        return response.data;
    },

    /**
     * Get all auctions for the authenticated seller
     */
    async getAuctions(): Promise<SellerAuction[]> {
        const response = await apiClient.get<SellerAuction[]>('/seller/auctions');
        return response.data;
    },

    /**
     * Get completed sales for the authenticated seller
     */
    async getSales(): Promise<Sale[]> {
        const response = await apiClient.get<Sale[]>('/seller/sales');
        return response.data;
    }
};

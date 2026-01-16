import apiClient from './config';

export interface BidRequest {
    auctionId: number;
    bidAmount: number;
}

export interface ProxyBidRequest {
    auctionId: number;
    maxAmount: number;
}

export interface Bid {
    id: number;
    auctionId: number;
    bidderId: number;
    bidAmount: number;
    bidType: string;
    createdAt: string;
    bidderName: string;
}

export interface BidResponse {
    id: number;
    auctionId: number;
    bidAmount: number;
    bidType: string;
    createdAt: string;
    bidderName: string;
}

export interface ProxyBidResponse {
    id: number;
    auctionId: number;
    bidderId: number;
    maxAmount: number;
    currentAmount: number;
    message?: string;
}

export const bidsApi = {
    async placeBid(data: BidRequest): Promise<BidResponse> {
        const response = await apiClient.post<BidResponse>('/bids', data);
        return response.data;
    },

    async placeProxyBid(data: ProxyBidRequest): Promise<ProxyBidResponse> {
        const response = await apiClient.post<ProxyBidResponse>('/bids/proxy', data);
        return response.data;
    },

    async getAuctionBids(auctionId: number): Promise<BidResponse[]> {
        const response = await apiClient.get<BidResponse[]>(`/bids/auction/${auctionId}`);
        return response.data;
    },

    async getUserBids(userId: number): Promise<BidResponse[]> {
        const response = await apiClient.get<BidResponse[]>(`/bids/user/${userId}`);
        return response.data;
    },

    async getUserProxyBid(auctionId: number, userId: number): Promise<ProxyBidResponse | null> {
        try {
            const response = await apiClient.get<ProxyBidResponse>(`/bids/proxy/auction/${auctionId}/user/${userId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },
};

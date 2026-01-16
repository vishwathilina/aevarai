import apiClient from './config';

export interface Auction {
    auctionId: number;
    productId: number;
    productTitle?: string;
    productCategory?: string;
    imageUrl?: string;
    startPrice: number;
    currentPrice: number | null;
    minIncrement: number;
    startTime: string;
    endTime: string;
    status: string;
}

export interface AuctionCreateRequest {
    productId: number;
    startPrice: number;
    minIncrement: number;
    startTime: string;
    endTime: string;
}

export interface AuctionResponse {
    auctionId: number;
    status: string;
    message: string;
}

export const auctionsApi = {
    async getLive(): Promise<Auction[]> {
        const response = await apiClient.get<Auction[]>('/auctions/live');
        return response.data;
    },

    async getById(id: number): Promise<Auction> {
        const response = await apiClient.get<Auction>(`/auctions/${id}`);
        return response.data;
    },

    async getAll(): Promise<Auction[]> {
        try {
            const response = await apiClient.get<Auction[]>('/admin/auctions');
            return response.data;
        } catch (error) {
            // If endpoint doesn't exist, return empty array
            console.warn('Get all auctions endpoint not available');
            return [];
        }
    },

    async create(data: AuctionCreateRequest): Promise<AuctionResponse> {
        const response = await apiClient.post<AuctionResponse>('/admin/auctions', data);
        return response.data;
    },

    async start(auctionId: number): Promise<AuctionResponse> {
        const response = await apiClient.put<AuctionResponse>(`/admin/auctions/${auctionId}/start`);
        return response.data;
    },

    async end(auctionId: number): Promise<AuctionResponse> {
        const response = await apiClient.put<AuctionResponse>(`/admin/auctions/${auctionId}/end`);
        return response.data;
    },

    async getWonAuctions(userId: number): Promise<Auction[]> {
        const response = await apiClient.get<Auction[]>(`/auctions/won/${userId}`);
        return response.data;
    },
};

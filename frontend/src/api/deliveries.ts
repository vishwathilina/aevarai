import apiClient from './config';

export interface Delivery {
    id: number;
    auctionId: number;
    deliveryType: string;
    deliveryFee: number;
    status: string;
    createdAt: string;
}

export interface DeliveryRequest {
    auctionId: number;
    deliveryType: string;
    deliveryFee: number;
}

export const deliveriesApi = {
    async create(data: DeliveryRequest): Promise<Delivery> {
        const response = await apiClient.post<Delivery>('/deliveries', data);
        return response.data;
    },

    async getByAuction(auctionId: number): Promise<Delivery | null> {
        try {
            const response = await apiClient.get<Delivery>(`/deliveries/auction/${auctionId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async update(id: number, data: Partial<DeliveryRequest>): Promise<Delivery> {
        const response = await apiClient.put<Delivery>(`/deliveries/${id}`, data);
        return response.data;
    },

    async complete(id: number): Promise<Delivery> {
        const response = await apiClient.put<Delivery>(`/deliveries/${id}/complete`);
        return response.data;
    },

    async getAll(): Promise<Delivery[]> {
        const response = await apiClient.get<Delivery[]>('/deliveries');
        return response.data;
    },
};

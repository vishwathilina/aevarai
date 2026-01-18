import apiClient from './config';

export interface PaymentRequest {
    auctionId: number;
    paymentMethod?: string;
    stripeToken?: string;
    amount?: number;
}

export interface PaymentResponse {
    id: number;
    auctionId: number;
    bidderId: number;
    amount: number;
    stripePaymentId: string;
    clientSecret?: string;
    status: string;
    paidAt?: string;
}

export const paymentsApi = {
    async initiateCheckout(data: PaymentRequest): Promise<PaymentResponse> {
        const response = await apiClient.post<PaymentResponse>('/payments/checkout', data);
        return response.data;
    },

    async getByAuction(auctionId: number): Promise<PaymentResponse | null> {
        try {
            const response = await apiClient.get<PaymentResponse>(`/payments/auction/${auctionId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async getByBidder(bidderId: number): Promise<PaymentResponse[]> {
        const response = await apiClient.get<PaymentResponse[]>(`/payments/bidder/${bidderId}`);
        return response.data;
    },
};

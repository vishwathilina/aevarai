import apiClient from './config';

export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    handlingFeePaid: boolean;
    sellerId: number;
    status: string;
    rejectionReason?: string;
    reviewRemarks?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCreateRequest {
    title: string;
    description: string;
    category: string;
    handlingFeePaid: boolean;
}

export interface ProductResponse {
    id: number;
    title: string;
    description: string;
    category: string;
    handlingFeePaid: boolean;
    sellerId: number;
    status: string;
    message?: string;
}

export const productsApi = {
    async getApproved(): Promise<Product[]> {
        const response = await apiClient.get<ProductResponse[]>('/products/approved');
        return response.data as Product[];
    },

    async getById(id: number): Promise<Product> {
        const response = await apiClient.get<ProductResponse>(`/products/${id}`);
        return response.data as Product;
    },

    async submitProduct(data: ProductCreateRequest): Promise<ProductResponse> {
        const response = await apiClient.post<ProductResponse>('/products', data);
        return response.data;
    },

    async getMyProducts(): Promise<Product[]> {
        const response = await apiClient.get<ProductResponse[]>('/products/my');
        return response.data as Product[];
    },

    async addProductImages(productId: number, imageUrls: string[]): Promise<void> {
        await apiClient.post(`/products/${productId}/images`, imageUrls);
    },

    async getProductImages(productId: number): Promise<{ id: number; productId: number; imageUrl: string; uploadedAt: string }[]> {
        const response = await apiClient.get(`/products/${productId}/images`);
        return response.data;
    },

    async addProductDocuments(productId: number, documents: { documentUrl: string; documentType?: string }[]): Promise<void> {
        await apiClient.post(`/products/${productId}/documents`, documents);
    },

    async getProductDocuments(productId: number): Promise<{ id: number; productId: number; documentUrl: string; documentType: string | null; uploadedAt: string }[]> {
        const response = await apiClient.get(`/products/${productId}/documents`);
        return response.data;
    },

    // Reviewer/Inspector APIs
    async getPendingProducts(): Promise<Product[]> {
        const response = await apiClient.get<ProductResponse[]>('/reviewer/products/pending');
        return response.data as Product[];
    },

    async approveProduct(productId: number, remarks?: string): Promise<ProductResponse> {
        const response = await apiClient.put<ProductResponse>(`/reviewer/products/${productId}/approve`, { remarks });
        return response.data;
    },

    async rejectProduct(productId: number, reason: string): Promise<ProductResponse> {
        const response = await apiClient.put<ProductResponse>(`/reviewer/products/${productId}/reject`, { reason });
        return response.data;
    },
};

import apiClient from './config';

export interface Inspection {
    id: number;
    productId: number;
    inspectorId: number;
    status: string;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface InspectionRequest {
    productId: number;
    inspectorId: number;
    remarks?: string;
}

export interface InspectionResponse {
    id: number;
    productId: number;
    inspectorId: number;
    status: string;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PendingInspectionProduct {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    sellerId: number;
    createdAt: string;
}

export const inspectionsApi = {
    async getPendingProducts(): Promise<PendingInspectionProduct[]> {
        // Backend route: GET /api/inspections/pending (products with DOC_APPROVED)
        const response = await apiClient.get<PendingInspectionProduct[]>('/inspections/pending');
        return response.data;
    },

    async getByProduct(productId: number): Promise<Inspection[]> {
        const response = await apiClient.get<InspectionResponse[]>(`/inspections/product/${productId}`);
        return response.data;
    },

    async create(data: InspectionRequest): Promise<InspectionResponse> {
        const response = await apiClient.post<InspectionResponse>('/inspections', data);
        return response.data;
    },

    async approve(inspectionId: number, remarks?: string): Promise<InspectionResponse> {
        const response = await apiClient.put<InspectionResponse>(`/inspections/${inspectionId}/approve`, { remarks });
        return response.data;
    },

    async reject(inspectionId: number, remarks?: string): Promise<InspectionResponse> {
        const response = await apiClient.put<InspectionResponse>(`/inspections/${inspectionId}/reject`, { remarks });
        return response.data;
    },
};

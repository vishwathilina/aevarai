import apiClient from './config';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt?: string;
}

export interface UserUpdateRequest {
    name?: string;
    email?: string;
    role?: string;
    active?: boolean;
}

export const usersApi = {
    async getAll(): Promise<User[]> {
        const response = await apiClient.get<User[]>('/admin/users');
        return response.data;
    },

    async getById(id: number): Promise<User> {
        const response = await apiClient.get<User>(`/admin/users/${id}`);
        return response.data;
    },

    async update(id: number, data: UserUpdateRequest): Promise<User> {
        const response = await apiClient.put<User>(`/admin/users/${id}`, data);
        return response.data;
    },

    async deactivate(id: number): Promise<void> {
        await apiClient.put(`/admin/users/${id}/deactivate`);
    },

    async activate(id: number): Promise<void> {
        await apiClient.put(`/admin/users/${id}/activate`);
    },
};

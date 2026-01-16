import apiClient from './config';

export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationsApi = {
    async getAll(userId?: number): Promise<Notification[]> {
        const params = userId ? { userId } : {};
        const response = await apiClient.get<Notification[]>('/notifications', { params });
        return response.data;
    },

    async markAsRead(id: number): Promise<void> {
        await apiClient.put(`/notifications/${id}/read`);
    },

    async markAllAsRead(userId: number): Promise<void> {
        await apiClient.put('/notifications/read-all', null, { params: { userId } });
    },
};

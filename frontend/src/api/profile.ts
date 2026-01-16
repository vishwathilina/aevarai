import apiClient from './config';

export interface ProfileStats {
    bidsPlaced: number;
    auctionsWon: number;
    itemsSold: number;
}

export interface Profile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    role: string;
    joinedDate: string;
    stats: ProfileStats;
}

export interface ProfileUpdateRequest {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
}

export const profileApi = {
    async get(): Promise<Profile> {
        const response = await apiClient.get<Profile>('/profile');
        return response.data;
    },

    async update(data: ProfileUpdateRequest): Promise<Profile> {
        const response = await apiClient.put<Profile>('/profile', data);
        return response.data;
    },
};

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authApi, LoginRequest, RegisterRequest, AuthResponse } from '@/api/auth';
import { toast } from 'sonner';

interface User {
    id: number;
    role: string;
    email?: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing auth on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response: AuthResponse = await authApi.login(credentials);

            const userData: User = {
                id: response.userId,
                role: response.role,
                email: credentials.email,
            };

            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setToken(response.token);
            }

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success(response.message || 'Login successful!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response: AuthResponse = await authApi.register(data);

            const userData: User = {
                id: response.userId,
                role: response.role,
                email: data.email,
                name: data.name,
            };

            // Auto-login after registration if token is provided
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setToken(response.token);
            }

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success(response.message || 'Account created successfully!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        toast.info('Logged out successfully');
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    userId: number;
    email: string;
    role: 'ADMIN' | 'STAFF';
    shopeeId: number;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);

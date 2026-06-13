import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  specialty?: string;
  role: string;
  avatar?: string;
  hospital?: string;
  bio?: string;
  qualifications?: string[];
  coverPhoto?: string;
  ahpraId?: string;
  yearsExperience?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set((state) => ({ ...state, user })),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'docnet-auth',
    }
  )
);

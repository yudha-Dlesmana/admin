import { create } from "zustand";
import { Token, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: Token | null;
  setAuth: (user: User, token: Token) => void;
  setToken: (token: Token) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, token: null }),
}));

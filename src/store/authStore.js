import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null, // { name: '', email: '', role: 'admin' | 'teacher' | 'student' }
  isAuthenticated: false,

  login: (userData) => {
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

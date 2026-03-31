import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
        set({ accessToken: token });
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          get().setToken(res.data.accessToken);
          set({ user: res.data.user, isAuthenticated: true });
          toast.success('Welcome to LUXE! 🎉');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', data);
          get().setToken(res.data.accessToken);
          set({ user: res.data.user, isAuthenticated: true });
          toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
          return { success: true, user: res.data.user };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        get().setToken(null);
        set({ user: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          get().setToken(null);
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          await api.post('/auth/forgot-password', { email });
          toast.success('Password reset email sent!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to send email';
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'luxe-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;

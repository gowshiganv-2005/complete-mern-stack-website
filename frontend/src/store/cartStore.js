import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    try {
      const res = await api.get('/cart');
      set({ cart: res.data.cart });
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch cart:', err.message);
      }
    }
  },

  addToCart: async (productId, quantity, size, color) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/cart/add', { productId, quantity, size, color });
      set({ cart: res.data.cart });
      toast.success('Added to cart!');
      get().openCart();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/update/${itemId}`, { quantity });
      set({ cart: res.data.cart });
    } catch (error) {
      toast.error('Failed to update cart');
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`);
      set((state) => ({
        cart: state.cart
          ? { ...state.cart, items: state.cart.items.filter((i) => i._id !== itemId) }
          : null,
      }));
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set((state) => ({ cart: state.cart ? { ...state.cart, items: [] } : null }));
    } catch {}
  },

  getItemCount: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));

export default useCartStore;

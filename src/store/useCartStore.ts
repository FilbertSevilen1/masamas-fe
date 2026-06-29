import { create } from 'zustand';
import api from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: string;
  thumbnail: string | null;
  stock: number;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cart');
      set({ items: res.data.items || [] });
    } catch {
      // User not logged in or no cart yet
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    try {
      const res = await api.post('/cart/add', { productId, quantity });
      set({ items: res.data.items || [] });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menambahkan ke keranjang';
      return { success: false, message };
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      await api.put(`/cart/item/${id}`, { quantity });
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      }));
    } catch {
      console.error('Gagal memperbarui jumlah produk');
    }
  },

  removeItem: async (id) => {
    try {
      await api.delete(`/cart/item/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    } catch {
      console.error('Gagal menghapus produk dari keranjang');
    }
  },

  clearCart: () => set({ items: [] }),
}));

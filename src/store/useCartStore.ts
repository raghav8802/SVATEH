import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  shade: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  itemCount: () => number;
  subtotal: () => number;
};

const FREE_SHIPPING_THRESHOLD = 2295;

export const getFreeShippingThreshold = () => FREE_SHIPPING_THRESHOLD;

export const useCartStore = create<CartState>((set, get) => ({
  isOpen: false,
  items: [
    {
      id: "lip-cheek-tint-rosey-nude",
      name: "Lip & Cheek Tint",
      shade: "Rosey Nude",
      price: 795,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "skin-tint-warm-honey",
      name: "Skin Tint",
      shade: "Warm Honey",
      price: 1295,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1631214524020-8e9c8248e1a8?q=80&w=400&auto=format&fit=crop",
    },
  ],

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (item) => {
    const qty = item.quantity ?? 1;
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
          isOpen: true,
        };
      }
      return {
        items: [...state.items, { ...item, quantity: qty }],
        isOpen: true,
      };
    });
  },

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, qty) => {
    if (qty < 1) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: qty } : i
      ),
    }));
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));

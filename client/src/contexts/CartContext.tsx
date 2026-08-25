import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  productId: number;
  variantId?: number | null;
  variantLabel?: string | null;
  slug: string;
  name: string;
  priceAmount: number;
  imageUrl: string;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotalAmount: number;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number | null) => void;
  removeItem: (productId: number, variantId?: number | null) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "mousa-glass-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.map(item => ({ ...item, variantId: item.variantId ?? null, variantLabel: item.variantLabel ?? null })) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalAmount: items.reduce((total, item) => total + item.priceAmount * item.quantity, 0),
    addItem: (item, quantity = 1) => {
      setItems(current => {
        const variantId = item.variantId ?? null;
        const existing = current.find(line => line.productId === item.productId && (line.variantId ?? null) === variantId);
        if (!existing) return [...current, { ...item, variantId, variantLabel: item.variantLabel ?? null, quantity: Math.min(quantity, item.stock) }];
        return current.map(line => line.productId === item.productId && (line.variantId ?? null) === variantId
          ? { ...line, ...item, quantity: Math.min(line.quantity + quantity, item.stock) }
          : line);
      });
    },
    updateQuantity: (productId, quantity, variantId = null) => {
      setItems(current => current.flatMap(line => {
        if (line.productId !== productId || (line.variantId ?? null) !== variantId) return [line];
        if (quantity <= 0) return [];
        return [{ ...line, quantity: Math.min(quantity, line.stock) }];
      }));
    },
    removeItem: (productId, variantId = null) => setItems(current => current.filter(item => item.productId !== productId || (item.variantId ?? null) !== variantId)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { allProducts, getProductImage } from "@/lib/rawMaterialsData";

export interface CartItem {
  id: number | string;
  supplier_id?: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  specs: string;
  priceUnit?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => boolean; // returns false if not authed
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isAuthenticated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { userId, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const previousUserId = useRef<string | null>(null);

  // ─── Sync helpers ────────────────────────────────────────────────────
  const saveCartToDb = useCallback(async (uid: string, cartItems: CartItem[]) => {
    await supabase
      .from("profiles")
      .update({
        last_cart_snapshot: cartItems as any,
        last_cart_updated_at: new Date().toISOString(),
      } as any)
      .eq("id", uid);
  }, []);

  const loadCartFromDb = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("last_cart_snapshot")
      .eq("id", uid)
      .maybeSingle();

    if (data?.last_cart_snapshot && Array.isArray(data.last_cart_snapshot)) {
      const loadedItems = data.last_cart_snapshot as CartItem[];
      
      // Hydrate items: If it's a static product, refresh its image from the local bundle
      const hydratedItems = loadedItems.map(item => {
        const staticMatch = allProducts.find(p => p.id === item.id);
        if (staticMatch) {
          return {
            ...item,
            image: getProductImage(staticMatch),
            name: staticMatch.name || item.name,
            brand: staticMatch.brand || item.brand,
            price: staticMatch.price || item.price,
            specs: staticMatch.specs || item.specs
          };
        }
        return item;
      });

      setItems(hydratedItems);
    } else {
      setItems([]);
    }
  }, []);

  // ─── Auth state listener ──────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !userId) {
      if (previousUserId.current !== null) {
        // Clear cart on logout
        setItems([]);
      }
      previousUserId.current = null;
    } else if (userId !== previousUserId.current) {
      // User signed in or switched user
      previousUserId.current = userId;
      loadCartFromDb(userId);
    }
  }, [userId, isAuthenticated, isAuthLoading, loadCartFromDb]);

  // ─── Persist cart to DB whenever items change (for logged-in users) ──
  useEffect(() => {
    if (!userId) return;
    // Debounce slightly to avoid hammering on rapid changes
    const timer = setTimeout(() => {
      saveCartToDb(userId, items);
    }, 500);
    return () => clearTimeout(timer);
  }, [items, userId, saveCartToDb]);

  // ─── Cart actions ─────────────────────────────────────────────────────
  const addToCart = (item: Omit<CartItem, "quantity">): boolean => {
    if (!isAuthenticated || !userId) {
      // Caller should show a toast/redirect
      return false;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  };

  const removeFromCart = (id: number | string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity < 1) { removeFromCart(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    if (userId) saveCartToDb(userId, []);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isAuthenticated }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

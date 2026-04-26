import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: number;
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
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isAuthenticated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      setItems(data.last_cart_snapshot as CartItem[]);
    } else {
      setItems([]);
    }
  }, []);

  // ─── Auth state listener ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const syncAuthState = async (event: string, session: any) => {
      const uid = session?.user?.id ?? null;

      if (!mounted) return;

      if (event === "SIGNED_OUT" || !uid) {
        // Clear cart in state on logout
        setItems([]);
        setUserId(null);
        setIsAuthenticated(false);
      } else if (event === "SIGNED_IN" && uid) {
        setUserId(uid);
        setIsAuthenticated(true);
        // Restore cart from DB only on fresh sign in
        await loadCartFromDb(uid);
      } else if (uid) {
        // For other events (TOKEN_REFRESHED, USER_UPDATED), just update auth state
        // Do NOT reload from DB to avoid overwriting pending local changes
        setUserId(uid);
        setIsAuthenticated(true);
      }
    };

    const handleAuthChange = (event: string, session: any) => {
      window.setTimeout(() => {
        void syncAuthState(event, session);
      }, 0);
    };

    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted) {
        const uid = session?.user?.id ?? null;
        if (uid) {
          setUserId(uid);
          setIsAuthenticated(true);
          await loadCartFromDb(uid);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadCartFromDb]);

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

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
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

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface WishlistItem {
  id: string; // The design ID
  name: string;
  image: string;
  category: string;
  style: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => boolean; // returns false if not authed
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
  isAuthenticated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { userId, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const previousUserId = useRef<string | null>(null);

  // ─── Sync helpers ────────────────────────────────────────────────────
  const saveWishlistToDb = useCallback(async (uid: string, wishlistItems: WishlistItem[]) => {
    const { error } = await supabase
      .from("profiles")
      .update({ wishlist: wishlistItems as any })
      .eq("id", uid);
    if (error) {
      console.warn("Wishlist save failed:", error.message);
    }
  }, []);

  const loadWishlistFromDb = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("wishlist")
      .eq("id", uid)
      .maybeSingle();

    if (!error && data && Array.isArray(data.wishlist)) {
      setItems(data.wishlist as WishlistItem[]);
    } else {
      setItems([]);
    }
  }, []);

  // ─── Auth state listener ──────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !userId) {
      if (previousUserId.current !== null) {
        setItems([]);
      }
      previousUserId.current = null;
    } else if (userId !== previousUserId.current) {
      previousUserId.current = userId;
      loadWishlistFromDb(userId);
    }
  }, [userId, isAuthenticated, isAuthLoading, loadWishlistFromDb]);

  // ─── Persist wishlist to DB whenever items change (for logged-in users) ──
  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => {
      saveWishlistToDb(userId, items);
    }, 500);
    return () => clearTimeout(timer);
  }, [items, userId, saveWishlistToDb]);

  // ─── Wishlist actions ─────────────────────────────────────────────────────
  const addToWishlist = (item: WishlistItem): boolean => {
    if (!isAuthenticated || !userId) return false;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
    return true;
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const clearWishlist = () => {
    setItems([]);
    if (userId) saveWishlistToDb(userId, []);
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, totalItems, isAuthenticated }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};

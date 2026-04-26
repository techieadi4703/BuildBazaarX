import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── Sync helpers ────────────────────────────────────────────────────
  const saveWishlistToDb = useCallback(async (uid: string, wishlistItems: WishlistItem[]) => {
    // Instead of altering the profiles table, we store the wishlist snapshot in the user's metadata
    // This avoids database schema mismatch issues and persists across devices securely.
    await supabase.auth.updateUser({
      data: {
        wishlist: wishlistItems
      }
    });
  }, []);

  const loadWishlistFromDb = useCallback(async (uid: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.wishlist && Array.isArray(user.user_metadata.wishlist)) {
      setItems(user.user_metadata.wishlist as WishlistItem[]);
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
        // Clear wishlist in state on logout
        setItems([]);
        setUserId(null);
        setIsAuthenticated(false);
      } else if (event === "SIGNED_IN" && uid) {
        setUserId(uid);
        setIsAuthenticated(true);
        // Restore wishlist from DB
        await loadWishlistFromDb(uid);
      } else if (uid) {
        setUserId(uid);
        setIsAuthenticated(true);
        await loadWishlistFromDb(uid);
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
          await loadWishlistFromDb(uid);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadWishlistFromDb]);

  // ─── Persist wishlist to DB whenever items change (for logged-in users) ──
  useEffect(() => {
    if (!userId) return;
    // Debounce slightly to avoid hammering on rapid changes
    const timer = setTimeout(() => {
      saveWishlistToDb(userId, items);
    }, 500);
    return () => clearTimeout(timer);
  }, [items, userId, saveWishlistToDb]);

  // ─── Wishlist actions ─────────────────────────────────────────────────────
  const addToWishlist = (item: WishlistItem): boolean => {
    if (!isAuthenticated || !userId) {
      return false;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev; // Already in wishlist
      return [...prev, item];
    });
    return true;
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  }

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

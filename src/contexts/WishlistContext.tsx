import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { trackEvent } from "@/lib/umami";

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
  const { userId, user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const previousUserId = useRef<string | null>(null);

  // ─── Sync helpers ────────────────────────────────────────────────────
  const saveWishlistToDb = useCallback(async (uid: string, wishlistItems: WishlistItem[]) => {
    // Store wishlist in the profiles table exactly like the cart does
    await supabase.from("profiles").upsert({
      id: uid,
      wishlist: wishlistItems.map(item => typeof item?.id === "string" ? item.id.replace(/^db-/, "").replace(/^mat-/, "") : item?.id)
    }, { onConflict: "id" });
  }, []);

  const loadWishlistFromDb = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("wishlist")
      .eq("id", uid)
      .maybeSingle();
      
    if (error || !data || !Array.isArray(data.wishlist)) {
      setItems([]);
      return;
    }

    const rawWishlist = data.wishlist;
    const wishlistIds = rawWishlist
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && typeof item.id === "string") {
          return item.id.replace(/^db-/, "").replace(/^mat-/, "");
        }
        return null;
      })
      .filter(Boolean) as string[];

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuids = wishlistIds.filter(id => uuidRegex.test(id));
    
    let designsData: any[] = [];
    let materialsData: any[] = [];

    if (uuids.length > 0) {
      const [designsRes, materialsRes] = await Promise.all([
        supabase.from("designs").select("*").in("id", uuids),
        supabase.from("supplier_products").select("*").in("id", uuids)
      ]);
      if (designsRes.data) designsData = designsRes.data;
      if (materialsRes.data) materialsData = materialsRes.data;
    }

    const builtItems: WishlistItem[] = [];
    const processedIds = new Set<string>();

    designsData.forEach(d => {
      builtItems.push({
        id: `db-${d.id}`,
        name: d.name || "Unknown Design",
        image: (d.images && d.images.length > 0) ? d.images[0] : "",
        category: d.category || "design",
        style: d.style || "Modern"
      });
      processedIds.add(d.id);
    });

    materialsData.forEach(m => {
      builtItems.push({
        id: `mat-${m.id}`,
        name: m.name || "Unknown Material",
        image: (m.images && m.images.length > 0) ? m.images[0] : "",
        category: m.category || "material",
        style: m.brand || "Standard"
      });
      processedIds.add(m.id);
    });

    // Fallback for missing items (legacy objects or local non-db items)
    wishlistIds.forEach(id => {
      if (!processedIds.has(id)) {
        const original = rawWishlist.find((r: any) => 
          typeof r === "object" && r !== null && 
          (r.id === id || r.id === `db-${id}` || r.id === `mat-${id}`)
        );
        if (original) {
          builtItems.push({
            id: typeof original.id === "string" ? original.id : `db-${id}`,
            name: original.name || "Unknown",
            image: original.image || "",
            category: original.category || "Unknown",
            style: original.style || "Unknown"
          });
        }
      }
    });

    setItems(builtItems);
  }, []);

  // ─── Auth state listener ──────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !userId) {
      if (previousUserId.current !== null) {
        // Clear wishlist on logout
        setItems([]);
      }
      previousUserId.current = null;
    } else if (userId !== previousUserId.current) {
      // User signed in or switched user
      previousUserId.current = userId;
      // Load wishlist from DB only on fresh sign in
      loadWishlistFromDb(userId);
    }
  }, [userId, isAuthenticated, isAuthLoading, loadWishlistFromDb]);

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
      trackEvent("wishlist-add", { itemId: item.id, type: item.category });
      return [...prev, item];
    });
    return true;
  };

  const removeFromWishlist = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      trackEvent("wishlist-remove", { itemId: id, type: item.category });
    }
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

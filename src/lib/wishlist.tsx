import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

type WishlistContextValue = {
  wishlistIds: string[];
  wishlistProducts: Product[];
  count: number;
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "nordhem.wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlistIds(JSON.parse(stored) as string[]);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds, hydrated]);

  const value = useMemo<WishlistContextValue>(() => {
    const wishlistProducts = wishlistIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    return {
      wishlistIds,
      wishlistProducts,
      count: wishlistIds.length,
      toggle: (id: string) =>
        setWishlistIds((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        ),
      isWishlisted: (id: string) => wishlistIds.includes(id),
      remove: (id: string) => setWishlistIds((prev) => prev.filter((item) => item !== id)),
      clear: () => setWishlistIds([]),
    };
  }, [wishlistIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

type RecentlyViewedContextValue = {
  viewedIds: string[];
  viewedProducts: Product[];
  addViewed: (id: string) => void;
  clearViewed: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "nordhem.recentlyViewed";

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setViewedIds(JSON.parse(stored) as string[]);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedIds));
  }, [viewedIds, hydrated]);

  const value = useMemo<RecentlyViewedContextValue>(() => {
    const viewedProducts = viewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    return {
      viewedIds,
      viewedProducts,
      addViewed: (id: string) =>
        setViewedIds((prev) => {
          const filtered = prev.filter((item) => item !== id);
          return [id, ...filtered].slice(0, 8); // Keep last 8 items
        }),
      clearViewed: () => setViewedIds([]),
    };
  }, [viewedIds]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

type CompareContextValue = {
  compareIds: string[];
  compareProducts: Product[];
  toggleCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  isComparing: (id: string) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "nordhem.compare";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCompareIds(JSON.parse(stored) as string[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
  }, [compareIds, hydrated]);

  const value = useMemo<CompareContextValue>(() => {
    const compareProducts = compareIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    return {
      compareIds,
      compareProducts,
      isOpen,
      setIsOpen,
      isComparing: (id: string) => compareIds.includes(id),
      toggleCompare: (id: string) =>
        setCompareIds((prev) => {
          if (prev.includes(id)) {
            return prev.filter((item) => item !== id);
          }
          if (prev.length >= 3) {
            return [...prev.slice(1), id]; // Max 3 items
          }
          return [...prev, id];
        }),
      removeCompare: (id: string) => setCompareIds((prev) => prev.filter((item) => item !== id)),
      clearCompare: () => setCompareIds([]),
    };
  }, [compareIds, isOpen]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

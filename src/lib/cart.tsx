import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

export type CartLine = { id: string; size: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  detailed: (CartLine & { product: Product })[];
  add: (id: string, size: string, qty?: number) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nordhem.cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored) as CartLine[]);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const detailed = lines
      .map((line) => {
        const product = products.find((p) => p.id === line.id);
        return product ? { ...line, product } : null;
      })
      .filter((l): l is CartLine & { product: Product } => l !== null);

    return {
      lines,
      detailed,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: detailed.reduce((n, l) => n + l.product.price * l.qty, 0),
      add: (id, size, qty = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.id === id && l.size === size);
          if (existing) {
            return prev.map((l) =>
              l.id === id && l.size === size ? { ...l, qty: l.qty + qty } : l,
            );
          }
          return [...prev, { id, size, qty }];
        }),
      remove: (id, size) =>
        setLines((prev) => prev.filter((l) => !(l.id === id && l.size === size))),
      setQty: (id, size, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => !(l.id === id && l.size === size))
            : prev.map((l) => (l.id === id && l.size === size ? { ...l, qty } : l)),
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

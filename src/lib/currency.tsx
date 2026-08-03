import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CurrencyCode = "GHS" | "EUR" | "USD" | "GBP";

export type CurrencyConfig = {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Multiplier from EUR base price
  label: string;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GHS: { code: "GHS", symbol: "GH₵", rate: 17.5, label: "GHS (GH₵)" },
  EUR: { code: "EUR", symbol: "€", rate: 1.0, label: "EUR (€)" },
  USD: { code: "USD", symbol: "$", rate: 1.08, label: "USD ($)" },
  GBP: { code: "GBP", symbol: "£", rate: 0.85, label: "GBP (£)" },
};

type CurrencyContextValue = {
  currency: CurrencyConfig;
  setCurrencyCode: (code: CurrencyCode) => void;
  formatPrice: (eurValue: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "nordhem.currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<CurrencyCode>("GHS");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && CURRENCIES[stored]) setCode(stored);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, code);
  }, [code, hydrated]);

  const value = useMemo<CurrencyContextValue>(() => {
    const currency = CURRENCIES[code] ?? CURRENCIES.GHS;

    return {
      currency,
      setCurrencyCode: (newCode: CurrencyCode) => {
        if (CURRENCIES[newCode]) setCode(newCode);
      },
      formatPrice: (eurValue: number) => {
        const converted = Math.round(eurValue * currency.rate);
        return `${currency.symbol}${converted.toLocaleString("en-US")}`;
      },
    };
  }, [code]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  discountValue: number; // e.g. 15 for 15%, 25 for €25
  minSpend?: number;
  active: boolean;
  usageCount: number;
  description: string;
  expiresAt?: string;
  createdAt: string;
}

const PROMO_STORAGE_KEY = "nordhem_promo_codes_v2";

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: "promo-1",
    code: "NORDIC15",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minSpend: 150,
    active: true,
    usageCount: 42,
    description: "15% off orders over €150",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "promo-2",
    code: "COPENHAGEN25",
    discountType: "FIXED",
    discountValue: 25,
    minSpend: 200,
    active: true,
    usageCount: 18,
    description: "€25 off Autumn / Winter orders over €200",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "promo-3",
    code: "FREESHIP",
    discountType: "FREE_SHIPPING",
    discountValue: 15,
    minSpend: 100,
    active: true,
    usageCount: 65,
    description: "Complimentary global express shipping",
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: "promo-4",
    code: "ATELIER10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minSpend: 0,
    active: true,
    usageCount: 124,
    description: "10% VIP welcoming discount on first order",
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export function getStoredPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return DEFAULT_PROMO_CODES;
  try {
    const data = localStorage.getItem(PROMO_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(DEFAULT_PROMO_CODES));
      return DEFAULT_PROMO_CODES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_PROMO_CODES;
  }
}

export function saveStoredPromoCodes(promos: PromoCode[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promos));
  window.dispatchEvent(new CustomEvent("nordhem_promo_sync"));
}

export function validatePromoCode(
  inputCode: string,
  subtotal: number,
): { valid: boolean; promo?: PromoCode; message: string; discountAmount: number } {
  const cleanCode = inputCode.trim().toUpperCase();
  const promos = getStoredPromoCodes();
  const promo = promos.find((p) => p.code.toUpperCase() === cleanCode);

  if (!promo) {
    return { valid: false, message: "Invalid promotional code", discountAmount: 0 };
  }

  if (!promo.active) {
    return {
      valid: false,
      message: "This promotional code is no longer active",
      discountAmount: 0,
    };
  }

  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "This promotional code has expired", discountAmount: 0 };
  }

  if (promo.minSpend && subtotal < promo.minSpend) {
    return {
      valid: false,
      message: `Minimum subtotal of €${promo.minSpend} required for code ${promo.code}`,
      discountAmount: 0,
    };
  }

  let discountAmount = 0;
  if (promo.discountType === "PERCENTAGE") {
    discountAmount = Math.round((subtotal * promo.discountValue) / 100);
  } else if (promo.discountType === "FIXED") {
    discountAmount = Math.min(promo.discountValue, subtotal);
  } else if (promo.discountType === "FREE_SHIPPING") {
    discountAmount = 15; // standard €15 shipping waived
  }

  return {
    valid: true,
    promo,
    message: `Applied ${promo.code} (${promo.description})`,
    discountAmount,
  };
}

export function incrementPromoUsage(code: string) {
  const promos = getStoredPromoCodes();
  const next = promos.map((p) => {
    if (p.code.toUpperCase() === code.toUpperCase()) {
      return { ...p, usageCount: p.usageCount + 1 };
    }
    return p;
  });
  saveStoredPromoCodes(next);
}

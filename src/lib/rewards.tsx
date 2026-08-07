import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type TierName = "Birch" | "Glacier" | "Borealis Black";

export type Perk = {
  id: string;
  code: string;
  title: string;
  description: string;
  cost: number;
  minTier: TierName;
  icon: string;
};

export const AVAILABLE_PERKS: Perk[] = [
  {
    id: "perk-shipping",
    code: "ECOSHIPPER",
    title: "Free Eco Express Shipping",
    description: "Complimentary zero-emission express shipping on all orders.",
    cost: 200,
    minTier: "Birch",
    icon: "Truck",
  },
  {
    id: "perk-repair",
    code: "REPAIR100",
    title: "Garment Repair Credit",
    description: "€50 complimentary tailor credit for hem & button refreshes.",
    cost: 450,
    minTier: "Glacier",
    icon: "Scissors",
  },
  {
    id: "perk-capsule-discount",
    code: "NORDIC15",
    title: "15% Capsule Order Discount",
    description: "Save 15% when purchasing any 3+ item wardrobe combination.",
    cost: 750,
    minTier: "Glacier",
    icon: "Sparkles",
  },
  {
    id: "perk-vip-access",
    code: "PRIVATECAPSULE",
    title: "Private Archive Access",
    description: "Early access to limited run Gotland wool & cashmere releases.",
    cost: 1200,
    minTier: "Borealis Black",
    icon: "KeyRound",
  },
];

type RewardsContextValue = {
  points: number;
  tier: TierName;
  nextTierPoints: number;
  progressToNextTier: number;
  redeemedPerks: string[];
  addPoints: (pts: number, reason?: string) => void;
  redeemPerk: (perkId: string) => boolean;
  history: { date: string; reason: string; points: number }[];
};

const RewardsContext = createContext<RewardsContextValue | null>(null);
const STORAGE_KEY = "nordhem.rewards";

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState<number>(680);
  const [redeemedPerks, setRedeemedPerks] = useState<string[]>(["perk-shipping"]);
  const [history, setHistory] = useState<{ date: string; reason: string; points: number }[]>([
    { date: "2026-08-01", reason: "Welcome to Nordic Circle", points: 300 },
    { date: "2026-08-03", reason: "Completed Natural Garment Care Guide", points: 150 },
    { date: "2026-08-05", reason: "Style Quiz Completion", points: 230 },
  ]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.points === "number") setPoints(parsed.points);
        if (Array.isArray(parsed.redeemedPerks)) setRedeemedPerks(parsed.redeemedPerks);
        if (Array.isArray(parsed.history)) setHistory(parsed.history);
      }
    } catch {
      /* ignore storage errors */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ points, redeemedPerks, history }));
  }, [points, redeemedPerks, history, hydrated]);

  const tier: TierName = useMemo(() => {
    if (points >= 1500) return "Borealis Black";
    if (points >= 500) return "Glacier";
    return "Birch";
  }, [points]);

  const { nextTierPoints, progressToNextTier } = useMemo(() => {
    if (tier === "Birch") {
      return {
        nextTierPoints: 500,
        progressToNextTier: Math.min(100, Math.round((points / 500) * 100)),
      };
    }
    if (tier === "Glacier") {
      const currentInTier = points - 500;
      return {
        nextTierPoints: 1500,
        progressToNextTier: Math.min(100, Math.round((currentInTier / 1000) * 100)),
      };
    }
    return { nextTierPoints: 1500, progressToNextTier: 100 };
  }, [points, tier]);

  const value = useMemo<RewardsContextValue>(() => {
    return {
      points,
      tier,
      nextTierPoints,
      progressToNextTier,
      redeemedPerks,
      history,
      addPoints: (pts, reason = "Activity Bonus") => {
        setPoints((prev) => prev + pts);
        const today = new Date().toISOString().split("T")[0];
        setHistory((prev) => [{ date: today, reason, points: pts }, ...prev]);
      },
      redeemPerk: (perkId: string) => {
        const perk = AVAILABLE_PERKS.find((p) => p.id === perkId);
        if (!perk) return false;
        if (redeemedPerks.includes(perkId)) return true;
        if (points < perk.cost) return false;

        setPoints((prev) => prev - perk.cost);
        setRedeemedPerks((prev) => [...prev, perkId]);
        const today = new Date().toISOString().split("T")[0];
        setHistory((prev) => [
          { date: today, reason: `Redeemed ${perk.title}`, points: -perk.cost },
          ...prev,
        ]);
        return true;
      },
    };
  }, [points, tier, nextTierPoints, progressToNextTier, redeemedPerks, history]);

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be used within RewardsProvider");
  return ctx;
}

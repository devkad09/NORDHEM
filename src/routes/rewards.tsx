import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  Sparkles,
  Truck,
  Scissors,
  CheckCircle2,
  Lock,
  History,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useRewards, AVAILABLE_PERKS, type TierName } from "@/lib/rewards";
import { toast } from "sonner";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Nordic Circle VIP & Loyalty Rewards — Nordhem" },
      {
        name: "description",
        content:
          "Track your points balance, unlock Nordic Circle tiers, and redeem exclusive garment repair & eco shipping vouchers.",
      },
      { property: "og:title", content: "Nordic Circle Rewards — Nordhem" },
    ],
  }),
  component: RewardsPage,
});

const TIER_DETAILS: Record<TierName, { title: string; desc: string; perks: string[] }> = {
  Birch: {
    title: "Birch Tier",
    desc: "Entry tier for natural wardrobe enthusiasts.",
    perks: ["1 pt per €1 spent", "Complimentary repair guides", "Birthday gift voucher"],
  },
  Glacier: {
    title: "Glacier VIP",
    desc: "Elevated tier for loyal Scandinavian collectors (500+ pts).",
    perks: [
      "1.5 pts per €1 spent",
      "Free Eco Express Shipping",
      "Complimentary annual tailor credit",
    ],
  },
  "Borealis Black": {
    title: "Borealis Black",
    desc: "Exclusive tier for core Nordhem patrons (1500+ pts).",
    perks: ["2 pts per €1 spent", "Private early archive access", "Custom sizing adjustments"],
  },
};

function RewardsPage() {
  const {
    points,
    tier,
    nextTierPoints,
    progressToNextTier,
    redeemedPerks,
    addPoints,
    redeemPerk,
    history,
  } = useRewards();

  const [simulatedSpend, setSimulatedSpend] = useState(250);

  const handleRedeem = (perkId: string) => {
    const success = redeemPerk(perkId);
    if (success) {
      toast.success("Voucher code unlocked! Check your account history for the discount code.");
    } else {
      toast.error("Insufficient Nordic Circle points balance for this reward.");
    }
  };

  const handleSimulateBonus = () => {
    const earned = Math.round(simulatedSpend * 1.5);
    addPoints(earned, `Simulated Order Purchase (€${simulatedSpend})`);
    toast.success(`Simulated order of €${simulatedSpend}! Earned +${earned} Nordic Circle points.`);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      {/* Hero Header */}
      <div className="bg-card border border-border rounded-xs p-6 md:p-12 relative overflow-hidden mb-12">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <Award size={13} className="text-clay" />
            Nordic Circle Loyalty Portal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-light text-foreground">
            Your Member Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Every garment crafted by Nordhem rewards your commitment to conscious, long-lasting
            Scandinavian design.
          </p>

          {/* Balance Cards */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-secondary/60 border border-border p-4 rounded-xs">
              <span className="eyebrow">Points Balance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl text-foreground font-light">{points}</span>
                <span className="text-xs text-muted-foreground">PTS</span>
              </div>
            </div>

            <div className="bg-secondary/60 border border-border p-4 rounded-xs">
              <span className="eyebrow">Current VIP Status</span>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck size={20} className="text-clay" />
                <span className="font-display text-2xl text-foreground">{tier}</span>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          {tier !== "Borealis Black" && (
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Next Tier: {tier === "Birch" ? "Glacier VIP" : "Borealis Black"}</span>
                <span>
                  {points} / {nextTierPoints} PTS
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-clay transition-all duration-500"
                  style={{ width: `${progressToNextTier}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Redeemable Perks Grid */}
      <div className="space-y-6 mb-16">
        <div>
          <h2 className="font-display text-3xl text-foreground">Redeemable Rewards & Vouchers</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Exchange your points for zero-emission shipping, tailor credits, and member discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AVAILABLE_PERKS.map((perk) => {
            const isRedeemed = redeemedPerks.includes(perk.id);
            const canAfford = points >= perk.cost;

            return (
              <div
                key={perk.id}
                className={`border rounded-xs p-6 flex flex-col justify-between transition-all ${
                  isRedeemed
                    ? "border-primary/50 bg-secondary/30"
                    : canAfford
                      ? "border-border bg-card hover:border-foreground/40"
                      : "border-border/60 bg-card/60 opacity-80"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-clay flex items-center gap-1.5">
                      <Sparkles size={12} /> {perk.cost} PTS REQUIRED
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border rounded-xs text-muted-foreground">
                      Min: {perk.minTier}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl text-foreground">{perk.title}</h3>
                  <p className="text-xs text-muted-foreground">{perk.description}</p>

                  {isRedeemed && (
                    <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xs flex items-center justify-between text-xs">
                      <span className="font-mono text-foreground font-medium">
                        Code: {perk.code}
                      </span>
                      <span className="text-primary font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} /> Unlocked
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isRedeemed ? "Available for your next order" : `${perk.cost} points required`}
                  </span>
                  <button
                    onClick={() => handleRedeem(perk.id)}
                    disabled={isRedeemed || !canAfford}
                    className={`btn-solid text-xs py-2 px-4 cursor-pointer ${
                      isRedeemed
                        ? "bg-secondary text-foreground hover:bg-secondary opacity-70"
                        : !canAfford
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                    }`}
                  >
                    {isRedeemed ? "Unlocked" : canAfford ? "Redeem Code" : "Insufficient Points"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Benefits & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Tier Matrix */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xs p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-display text-2xl text-foreground">Nordic Circle Tiers</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Unlock elevated privileges as your points grow.
            </p>
          </div>

          <div className="space-y-4">
            {(Object.keys(TIER_DETAILS) as TierName[]).map((tierKey) => {
              const details = TIER_DETAILS[tierKey];
              const isCurrent = tier === tierKey;

              return (
                <div
                  key={tierKey}
                  className={`border p-4 rounded-xs transition-all ${
                    isCurrent
                      ? "border-clay bg-secondary/40 shadow-xs"
                      : "border-border bg-background/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-xl text-foreground">{details.title}</h4>
                    {isCurrent && (
                      <span className="eyebrow bg-clay text-clay-foreground px-2 py-0.5 rounded-xs">
                        Your Current Tier
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{details.desc}</p>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {details.perks.map((p, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-foreground/80 flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={12} className="text-clay shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Points Simulator */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xs p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-display text-2xl text-foreground">Points Earnings Simulator</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Estimate points earned on your next order.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">Simulated Order Total (€)</label>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={simulatedSpend}
                onChange={(e) => setSimulatedSpend(Number(e.target.value))}
                className="w-full accent-clay cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
                <span>€50</span>
                <span className="text-foreground font-semibold text-sm">€{simulatedSpend}</span>
                <span>€1,000</span>
              </div>
            </div>

            <div className="bg-secondary/70 border border-border p-4 rounded-xs space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Base Points Rate:</span>
                <span className="font-mono">1.5x Multiplier</span>
              </div>
              <div className="flex justify-between font-medium text-foreground text-sm pt-2 border-t border-border">
                <span>Earned Points:</span>
                <span className="font-mono text-clay">+{Math.round(simulatedSpend * 1.5)} PTS</span>
              </div>
            </div>

            <button
              onClick={handleSimulateBonus}
              className="btn-outline w-full text-xs py-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={14} /> Add Demo Order Points
            </button>
          </div>

          {/* Activity History */}
          <div className="pt-4 border-t border-border">
            <h4 className="eyebrow flex items-center gap-1.5 mb-3">
              <History size={13} /> Activity History
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-border/50"
                >
                  <div>
                    <p className="text-foreground/90 font-medium">{item.reason}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                  <span
                    className={`font-mono text-xs font-semibold ${item.points > 0 ? "text-clay" : "text-foreground/60"}`}
                  >
                    {item.points > 0 ? `+${item.points}` : item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

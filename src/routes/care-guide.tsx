import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Feather, ShieldCheck, Sparkles, Send, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/care-guide")({
  head: () => ({
    meta: [
      { title: "Garment Care & Lifetime Mending — Nordhem" },
      { name: "description", content: "Learn how to care for Gotland wool, alpaca, linen, and claim free lifetime repairs." },
    ],
  }),
  component: CareGuidePage,
});

const CARE_GUIDES = [
  {
    material: "Gotland & Virgin Wool Outerwear",
    tips: [
      "Spot clean with cold water & natural wool detergent.",
      "Air out outdoors on cedar hangers after wear — wool naturally sheds odors.",
      "Never machine dry or apply direct dry heat.",
      "Store seasonally with dried lavender or cedar blocks to repel moths.",
    ],
  },
  {
    material: "Alpaca & Merino Knitwear",
    tips: [
      "Hand wash cold in a clean basin with gentle wool wash.",
      "Press gently between dry towels to remove moisture; do not wring or twist.",
      "Dry flat on a mesh drying rack to preserve raglan sleeve shoulder shape.",
      "Fold knitwear in drawers rather than hanging to prevent shoulder stretch.",
    ],
  },
  {
    material: "Washed European Flax Linen",
    tips: [
      "Machine wash gentle at 30°C with mild liquid detergent.",
      "Line dry in shade to preserve organic fiber strength.",
      "Embrace natural linen creases — they soften and drape beautifully over time.",
    ],
  },
];

function CareGuidePage() {
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [garmentName, setGarmentName] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [email, setEmail] = useState("");

  function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setClaimSubmitted(true);
    toast.success("Lifetime mending claim received. Our atelier will reach out with prepaid shipping details.");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24 space-y-16">
      <div className="text-center space-y-3">
        <p className="eyebrow flex items-center justify-center gap-1.5">
          <Feather size={14} /> Material Longevity
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Garment Care & Lifetime Repair</h1>
        <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
          Nordhem garments are built for a decade. Proper care preserves natural oils, yarn elasticity, and structural drape.
        </p>
      </div>

      {/* Care Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {CARE_GUIDES.map((guide) => (
          <div key={guide.material} className="border border-border bg-card p-6 space-y-4 rounded">
            <h3 className="font-display text-xl">{guide.material}</h3>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              {guide.tips.map((tip, idx) => (
                <li key={idx}>— {tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Lifetime Mending Claim Form */}
      <div className="border border-border bg-card p-8 md:p-12 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-border pb-6">
          <p className="eyebrow flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck size={16} /> Complimentary Lifetime Mending
          </p>
          <h2 className="font-display text-3xl">Submit a Garment Repair Claim</h2>
          <p className="text-xs text-muted-foreground">
            Worn seam, missing button, or snag on your Nordhem piece? Submit below for free atelier repair.
          </p>
        </div>

        {!claimSubmitted ? (
          <form onSubmit={handleClaim} className="space-y-4 max-w-xl">
            <div>
              <label className="eyebrow text-[0.65rem] block mb-1">Your Email</label>
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="eyebrow text-[0.65rem] block mb-1">Nordhem Garment Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Halland Wool Coat"
                value={garmentName}
                onChange={(e) => setGarmentName(e.target.value)}
                className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="eyebrow text-[0.65rem] block mb-1">Describe Needed Repair</label>
              <textarea
                required
                rows={3}
                placeholder="Loose sleeve button or frayed hem seam..."
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none resize-none"
              />
            </div>

            <button type="submit" className="btn-solid py-3 px-8 text-xs uppercase tracking-widest flex items-center gap-2">
              <Send size={14} /> Submit Repair Request
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-3 animate-fade-up">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={20} />
            </div>
            <h3 className="font-display text-2xl">Claim Submitted</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Our Gothenburg atelier will email prepaid shipping label instructions to <strong className="text-foreground">{email}</strong> within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

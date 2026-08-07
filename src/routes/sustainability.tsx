import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Droplets,
  Wind,
  ShieldCheck,
  Recycle,
  Sparkles,
  MapPin,
  CheckCircle2,
  Send,
  Leaf,
} from "lucide-react";
import { useRewards } from "@/lib/rewards";
import { toast } from "sonner";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability & Material Traceability — Nordhem" },
      {
        name: "description",
        content:
          "Trace the origin of natural Scandinavian fibres, calculate your eco-savings, and join our circular garment repair & trade-in program.",
      },
      { property: "og:title", content: "Sustainability — Nordhem" },
    ],
  }),
  component: SustainabilityPage,
});

const ORIGINS = [
  {
    material: "100% Organic Gotland Wool",
    location: "Gotland, Sweden",
    desc: "Unbleached, naturally water-repellent wool sourced from small-scale Gotland sheep farms prioritizing animal welfare.",
    waterSavedPerKg: 3400,
    co2SavedPerKg: 14.2,
  },
  {
    material: "European Long-Staple Linen",
    location: "Normandy, France",
    desc: "Rain-fed flax requiring zero synthetic pesticides, woven into breathable textiles that grow softer with every wash.",
    waterSavedPerKg: 2800,
    co2SavedPerKg: 9.8,
  },
  {
    material: "Recycled Post-Consumer Cashmere",
    location: "Prato, Italy",
    desc: "Mechanically shredded and spun without re-dyeing, preserving original fibre color while reducing energy usage by 85%.",
    waterSavedPerKg: 5200,
    co2SavedPerKg: 22.5,
  },
];

function SustainabilityPage() {
  const [selectedGarmentCount, setSelectedGarmentCount] = useState(3);
  const [activeMaterialIdx, setActiveMaterialIdx] = useState(0);

  // Garment Repair / Recycle Form State
  const [repairForm, setRepairForm] = useState({
    name: "",
    email: "",
    garmentName: "Gotland Wool Coat",
    condition: "Good - Minor Seam Wear",
    notes: "",
  });
  const [repairSubmitted, setRepairSubmitted] = useState(false);

  const { addPoints } = useRewards();

  const activeOrigin = ORIGINS[activeMaterialIdx];

  // Calculated Metrics
  const totalWaterSaved = Math.round(activeOrigin.waterSavedPerKg * selectedGarmentCount * 0.8);
  const totalCo2Saved = (activeOrigin.co2SavedPerKg * selectedGarmentCount * 0.8).toFixed(1);

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairForm.email || !repairForm.name) {
      toast.error("Please fill in your name and email address.");
      return;
    }

    setRepairSubmitted(true);
    addPoints(150, "Submitted Garment Trade-In / Repair Request");
    toast.success("Trade-in request received! Earned 150 Nordic Circle points.");
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      {/* Hero Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground mb-4">
          <Leaf size={13} className="text-clay" />
          Traceability & Eco-Impact
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-light text-foreground">
          Clothes Made to Outlast Trends
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
          We work exclusively with natural, single-origin fibres harvested with care. No synthetic
          microplastics, no toxic dye baths.
        </p>
      </div>

      {/* Material Origin Explorer */}
      <div className="bg-card border border-border rounded-xs p-6 md:p-10 mb-16 space-y-8">
        <div>
          <h2 className="font-display text-3xl text-foreground">Material Provenance & Origins</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select a fibre to inspect its farm source and environmental metrics.
          </p>
        </div>

        {/* Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ORIGINS.map((item, idx) => {
            const isActive = activeMaterialIdx === idx;
            return (
              <button
                key={item.material}
                onClick={() => setActiveMaterialIdx(idx)}
                className={`p-5 text-left border rounded-xs transition-all cursor-pointer ${
                  isActive
                    ? "border-primary bg-secondary/50 shadow-xs"
                    : "border-border hover:border-foreground/40 bg-background/40"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-clay font-medium mb-1">
                  <MapPin size={13} /> {item.location}
                </div>
                <h3 className="font-display text-xl text-foreground">{item.material}</h3>
              </button>
            );
          })}
        </div>

        {/* Selected Origin Card */}
        <div className="bg-secondary/40 border border-border p-6 rounded-xs space-y-6">
          <div className="space-y-2">
            <span className="eyebrow text-clay">Fibre Breakdown</span>
            <h3 className="font-display text-2xl text-foreground">{activeOrigin.material}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {activeOrigin.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-card border border-border rounded-xs text-clay">
                <Droplets size={20} />
              </div>
              <div>
                <span className="eyebrow">Water Saved / kg</span>
                <p className="font-display text-xl text-foreground">
                  {activeOrigin.waterSavedPerKg} Liters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-card border border-border rounded-xs text-clay">
                <Wind size={20} />
              </div>
              <div>
                <span className="eyebrow">CO2 Avoided</span>
                <p className="font-display text-xl text-foreground">
                  {activeOrigin.co2SavedPerKg} kg CO2e
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-card border border-border rounded-xs text-clay">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="eyebrow">Pesticide Use</span>
                <p className="font-display text-xl text-foreground">0% Synthetic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Eco-Impact Savings Calculator */}
      <div className="bg-card border border-border rounded-xs p-6 md:p-10 mb-16 space-y-8">
        <div>
          <h2 className="font-display text-3xl text-foreground">Personal Eco-Savings Calculator</h2>
          <p className="text-xs text-muted-foreground mt-1">
            See how your Nordhem wardrobe compares against conventional fast-fashion polyester
            garments.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">Number of Nordhem Garments in Wardrobe</label>
            <input
              type="range"
              min="1"
              max="10"
              value={selectedGarmentCount}
              onChange={(e) => setSelectedGarmentCount(Number(e.target.value))}
              className="w-full accent-clay cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
              <span>1 Garment</span>
              <span className="text-foreground font-semibold text-sm">
                {selectedGarmentCount} Pieces
              </span>
              <span>10 Garments</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-secondary/50 border border-border p-6 rounded-xs">
            <div>
              <span className="eyebrow">Estimated Water Saved</span>
              <div className="font-display text-4xl text-foreground mt-1 font-light">
                {totalWaterSaved.toLocaleString()}{" "}
                <span className="text-base text-muted-foreground font-sans">Liters</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Equivalent to 45 days of household drinking water.
              </p>
            </div>

            <div>
              <span className="eyebrow">Estimated CO2 Emissions Avoided</span>
              <div className="font-display text-4xl text-foreground mt-1 font-light">
                {totalCo2Saved}{" "}
                <span className="text-base text-muted-foreground font-sans">kg CO2</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Equivalent to driving 120 km in a standard petrol car.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Circular Garment Repair & Recycle Program */}
      <div className="bg-card border border-border rounded-xs p-6 md:p-10">
        <div className="max-w-2xl space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <Recycle size={13} className="text-clay" />
            Nordic Circularity Pledge
          </div>
          <h2 className="font-display text-3xl text-foreground">
            Garment Repair & Trade-In Initiative
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            If your Nordhem coat needs a seam re-stitched, a button reinforced, or if you wish to
            trade in a retired piece for voucher credit, send it to our Copenhagen studio.
          </p>
        </div>

        {!repairSubmitted ? (
          <form onSubmit={handleRepairSubmit} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Astrid Lindgren"
                  value={repairForm.name}
                  onChange={(e) => setRepairForm({ ...repairForm, name: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="eyebrow block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="astrid@nordhem.studio"
                  value={repairForm.email}
                  onChange={(e) => setRepairForm({ ...repairForm, email: e.target.value })}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-1">Garment Model</label>
              <select
                value={repairForm.garmentName}
                onChange={(e) => setRepairForm({ ...repairForm, garmentName: e.target.value })}
                className="field bg-transparent"
              >
                <option value="Gotland Wool Coat" className="bg-card">
                  Gotland Wool Coat
                </option>
                <option value="Merino Ribbed Crewneck" className="bg-card">
                  Merino Ribbed Crewneck
                </option>
                <option value="Washed Linen Shirt" className="bg-card">
                  Washed Linen Shirt
                </option>
                <option value="Cashmere Turtleneck" className="bg-card">
                  Cashmere Turtleneck
                </option>
                <option value="Tailored Wide Trousers" className="bg-card">
                  Tailored Wide Trousers
                </option>
              </select>
            </div>

            <div>
              <label className="eyebrow block mb-1">Repair Request or Trade-In Notes</label>
              <textarea
                rows={3}
                placeholder="Specify if you need button repair, hem adjustment, or trade-in credit..."
                value={repairForm.notes}
                onChange={(e) => setRepairForm({ ...repairForm, notes: e.target.value })}
                className="field"
              />
            </div>

            <button
              type="submit"
              className="btn-solid text-xs py-3 px-6 flex items-center gap-2 cursor-pointer"
            >
              <Send size={14} /> Submit Repair / Trade-In Request
            </button>
          </form>
        ) : (
          <div className="bg-secondary/60 border border-border p-6 rounded-xs max-w-xl space-y-4 animate-fade-up">
            <div className="flex items-center gap-2 text-clay">
              <CheckCircle2 size={20} />
              <span className="font-display text-xl text-foreground font-medium">
                Request Confirmed
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Thank you, {repairForm.name}. A pre-paid shipping label has been dispatched to{" "}
              {repairForm.email}.
            </p>
            <div className="bg-card border border-border p-4 rounded-xs text-xs space-y-1">
              <span className="eyebrow text-clay">Trade-In Voucher Code</span>
              <p className="font-mono text-sm font-semibold text-foreground">RECYCLE150-TRADEIN</p>
              <p className="text-[11px] text-muted-foreground">
                +150 Nordic Circle points added to your account!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

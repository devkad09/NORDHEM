import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ShieldCheck, Feather, Compass, HeartHandshake, CheckCircle2 } from "lucide-react";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";
import look4 from "@/assets/look-4.jpg";
import look5 from "@/assets/look-5.jpg";
import look6 from "@/assets/look-6.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us & Story — Nordhem" },
      {
        name: "description",
        content:
          "Founded in Copenhagen by Ingrid Halvorsen in 2019. Discover Nordhem's philosophy of quiet permanence, natural materials, small-batch artisan tailoring, and lifetime repair.",
      },
      { property: "og:title", content: "About Us & Story — Nordhem" },
      {
        property: "og:description",
        content: "Our story, founder's journal, materials, and why we build for a decade.",
      },
    ],
  }),
  component: AboutPage,
});

const ATELIER_PILLARS = [
  {
    id: "materials",
    icon: Feather,
    title: "1. Pure Organic Fibres",
    subtitle: "Undyed & Traceable",
    description:
      "We source undyed Gotland sheep wool, extra-fine Italian merino, zero-chemical brushed alpaca, and washed Lithuanian linen. Synthetics are strictly prohibited in our knits to ensure 100% natural breathability.",
    stats: "100% Natural & Chemical-Free",
    image: look5,
  },
  {
    id: "makers",
    icon: HeartHandshake,
    title: "2. Artisan Heritage Mills",
    subtitle: "Porto, Hawick & Biella",
    description:
      "Our outerwear and tailoring are crafted by four family-owned ateliers across Portugal, Scotland, and Italy. Each workshop carries over 80 years of textile heritage, paying living wages to master tailors.",
    stats: "4 Heritage Family Ateliers",
    image: look2,
  },
  {
    id: "permanence",
    icon: Compass,
    title: "3. Seasonless Permanence",
    subtitle: "Built to Outlast Trends",
    description:
      "We release no seasonal collections. A piece remains in our permanent archive for years until we discover an authentic way to improve its cut or weave. Getting dressed should be quiet, effortless, and timeless.",
    stats: "11 Archive Silhouettes",
    image: look1,
  },
  {
    id: "repair",
    icon: ShieldCheck,
    title: "4. Lifetime Mending Pledge",
    subtitle: "Repaired For Life",
    description:
      "Garments should mature alongside their owner. We offer complimentary lifetime repair service for any worn seam, button, or snag on every Nordhem piece ever created.",
    stats: "Free Lifetime Garment Repair",
    image: look6,
  },
];

function AboutPage() {
  const [activeTab, setActiveTab] = useState(0);
  const activePillar = ATELIER_PILLARS[activeTab];

  return (
    <div className="space-y-24 pb-20 md:space-y-36 md:pb-32">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-card py-20 px-5 text-center md:py-32">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="eyebrow tracking-[0.3em] flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-amber-700/80" /> Est. Copenhagen, 2019
          </p>
          <h1 className="font-display text-4xl font-light leading-tight tracking-tight text-foreground md:text-6xl">
            Clothes designed for quiet permanence, not next season’s landfill.
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Nordhem was founded with a singular conviction: to craft an unhurried, essential wardrobe from the finest natural Scandinavian materials, tailored to be worn for a decade.
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 border-t border-border/80 pt-12 md:grid-cols-4">
          {[
            { label: "Archive Silhouettes", value: "11" },
            { label: "Traceable Fibres", value: "100%" },
            { label: "Family Ateliers", value: "4" },
            { label: "Lifetime Garment Repair", value: "Included" },
          ].map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="font-display text-3xl md:text-4xl text-foreground font-light">{metric.value}</p>
              <p className="eyebrow text-[0.65rem] text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder's Journal & Story ("About Me / Our Founder") */}
      <section className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="relative overflow-hidden bg-secondary lg:col-span-6 aspect-[4/5]">
            <img
              src={look3}
              alt="Founder Ingrid Halvorsen in the Copenhagen Nordhem studio"
              className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute bottom-6 left-6 right-6 border border-background/20 bg-background/85 p-4 backdrop-blur-md">
              <p className="font-display text-lg">Ingrid Halvorsen</p>
              <p className="eyebrow text-muted-foreground">Founder & Creative Lead, Copenhagen</p>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-6 lg:max-w-xl">
            <p className="eyebrow">Founder’s Journal</p>
            <h2 className="font-display text-3xl md:text-4xl">
              “I wanted to stop chasing 52 micro-seasons and make 11 things exceptionally well.”
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                After working as a senior pattern designer in Paris and Stockholm, I grew disillusioned with the relentless pace of commercial apparel. We were creating garments designed to fall apart in six washes so customers would buy again.
              </p>
              <p>
                In 2019, I returned home to Copenhagen and rented a small light-filled workshop in Nørrebro. I spent eight months perfecting a single Gotland wool coat pattern before making our first eleven pieces.
              </p>
              <p>
                Nordhem is the antithesis of modern fast fashion. We don’t run sales. We don’t overproduce. We work directly with small family mills in Portugal, Scotland, and Italy who share our reverence for texture, durability, and quiet elegance.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <blockquote className="font-display text-xl italic text-foreground">
                “Getting dressed should be the calmest decision of your morning.”
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Atelier & Craftsmanship Pillars */}
      <section className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="border-b border-border pb-6 text-center md:text-left">
          <p className="eyebrow">The Atelier Standards</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">What makes Nordhem magnificent</h2>
        </div>

        {/* Tab Controls */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ATELIER_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(idx)}
                className={`flex flex-col items-start p-5 text-left border transition-all cursor-pointer ${
                  isActive
                    ? "border-foreground bg-foreground text-background shadow-md"
                    : "border-border bg-card text-foreground hover:border-foreground/60"
                }`}
              >
                <Icon size={20} className={isActive ? "text-background" : "text-muted-foreground"} />
                <span className="mt-4 font-sans text-sm font-medium">{pillar.title}</span>
                <span className={`mt-1 text-xs ${isActive ? "text-background/80" : "text-muted-foreground"}`}>
                  {pillar.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Display Card */}
        <div className="mt-8 grid items-center gap-8 border border-border bg-card p-6 md:grid-cols-12 md:p-10">
          <div className="space-y-5 md:col-span-7">
            <span className="inline-block rounded bg-secondary px-3 py-1 text-xs font-mono text-foreground font-medium">
              {activePillar.stats}
            </span>
            <h3 className="font-display text-3xl">{activePillar.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {activePillar.description}
            </p>

            <ul className="space-y-2 pt-2 text-xs font-medium text-foreground">
              {["100% Traceable supply chain", "Fair living wages for all artisans", "Recyclable plastic-free packaging"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link to="/shop" className="btn-solid inline-flex items-center gap-2 text-xs uppercase tracking-widest">
                Explore The Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative overflow-hidden bg-secondary aspect-[4/5] rounded">
            <img
              src={activePillar.image}
              alt={activePillar.title}
              className="h-full w-full object-cover transition-opacity duration-500"
            />
          </div>
        </div>
      </section>

      {/* Material Palette Grid */}
      <section className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="text-center">
          <p className="eyebrow">Material Tactility</p>
          <h2 className="mt-2 font-display text-3xl">Selected Natural Fibres</h2>
          <p className="mt-3 text-xs text-muted-foreground max-w-xl mx-auto">
            Every yarn and cloth is chosen for its structural weight, breathability, and capacity to age gracefully.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Undyed Gotland Wool",
              weight: "480 GSM",
              origin: "Sweden / Portugal",
              desc: "Dense, naturally water-repellent virgin fleece from Gotland sheep. Unstained and naturally grey.",
              image: look4,
            },
            {
              title: "Brushed Baby Alpaca",
              weight: "320 GSM",
              origin: "Peru / Italy",
              desc: "Knitted to a soft mid-gauge with a gentle halo. Unmatched warmth without synthetic weight.",
              image: look1,
            },
            {
              title: "Washed European Linen",
              weight: "210 GSM",
              origin: "Lithuania",
              desc: "Garment-washed flax linen with an organic drape. Softens with every laundering cycle.",
              image: look3,
            },
            {
              title: "Garment-Dyed Cotton",
              weight: "240 GSM",
              origin: "Portugal",
              desc: "Heavyweight organic cotton jersey knit tight to hold structural boxy shoulders.",
              image: look5,
            },
          ].map((mat) => (
            <div key={mat.title} className="group border border-border bg-card p-5 transition-all hover:border-foreground">
              <div className="aspect-square overflow-hidden bg-secondary mb-4">
                <img
                  src={mat.image}
                  alt={mat.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="eyebrow text-[0.65rem] text-muted-foreground">{mat.origin} • {mat.weight}</p>
              <h3 className="mt-1 font-display text-xl">{mat.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{mat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="mx-auto max-w-5xl px-5 text-center">
        <div className="border border-border bg-card py-16 px-8 shadow-sm">
          <p className="eyebrow">Experience Nordhem</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Ready to discover your essential wardrobe?</h2>
          <p className="mx-auto mt-4 max-w-lg text-xs text-muted-foreground leading-relaxed">
            Browse our small-batch archive of coats, knitwear, shirts, and trousers. Free worldwide carbon-neutral shipping and lifetime mending included.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/shop" className="btn-solid py-3.5 px-8 text-xs uppercase tracking-widest">
              View Shop
            </Link>
            <Link to="/lookbook" className="btn-outline py-3.5 px-8 text-xs uppercase tracking-widest">
              View Lookbook
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


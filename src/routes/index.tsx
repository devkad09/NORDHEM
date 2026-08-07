import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ArrowRight, Layers, Sparkles, Award, Leaf } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { products, lookbook } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { VipBanner } from "@/components/VipBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nordhem — Elevated Basics, Quietly Made" },
      {
        name: "description",
        content:
          "Wool outerwear, merino knitwear and washed linen in small runs. Nordhem makes elevated basics for people who dress once and think about it no further.",
      },
      { property: "og:title", content: "Nordhem — Elevated Basics, Quietly Made" },
      {
        property: "og:description",
        content: "A minimalist Scandinavian label. Small runs, natural fibres, nothing loud.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="overflow-x-hidden">
      {/* Animated Hero Section */}
      <section className="relative overflow-hidden">
        <div className="h-[72vh] w-full overflow-hidden md:h-[86vh]">
          <img
            src={heroImage}
            alt="Two models in neutral wool and linen tailoring in a bare concrete interior"
            width={1920}
            height={1088}
            className="h-full w-full object-cover animate-kenburns"
          />
        </div>

        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-background/80 via-background/35 to-transparent">
          <div className="mx-auto w-full max-w-[110rem] px-5 md:px-10">
            <div className="max-w-lg">
              <div className="animate-fade-up flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clay opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-clay"></span>
                </span>
                <p className="eyebrow">Autumn / Winter</p>
              </div>

              <h1 className="animate-fade-up animation-delay-100 mt-5 font-display text-4xl leading-[1.08] md:text-6xl text-foreground">
                Clothes that ask
                <br />
                <span className="italic font-light">nothing of you.</span>
              </h1>

              <p className="animate-fade-up animation-delay-200 mt-5 max-w-sm text-sm leading-relaxed text-foreground/80">
                Elevated basics in natural fibres, cut for a long life and a short morning.
              </p>

              <div className="animate-fade-up animation-delay-300 mt-9">
                <Link to="/shop" className="btn-solid group inline-flex items-center gap-3">
                  <span>Shop the collection</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Ambient Badges on Hero */}
        <div className="hidden lg:flex absolute bottom-12 right-12 z-10 gap-3">
          <div className="rounded border border-background/20 bg-background/80 px-4 py-2.5 backdrop-blur-md text-xs shadow-lg animate-fade-up animation-delay-300">
            <p className="eyebrow text-[0.6rem] text-muted-foreground">Natural Materials</p>
            <p className="font-medium text-foreground">100% Undyed Gotland Wool</p>
          </div>
          <div className="rounded border border-background/20 bg-background/80 px-4 py-2.5 backdrop-blur-md text-xs shadow-lg animate-fade-up animation-delay-400">
            <p className="eyebrow text-[0.6rem] text-muted-foreground">Artisan Heritage</p>
            <p className="font-medium text-foreground">Hand-Linked in Porto & Hawick</p>
          </div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
          <span className="eyebrow text-[10px] tracking-[0.25em] mb-1">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-foreground/60" />
        </div>
      </section>

      {/* Infinite Marquee Ticker */}
      <section className="border-y border-border bg-card/60 py-3.5 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-[0.25em] text-foreground/80 font-medium">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-4">
              <span>✦ Natural Undyed Fibres</span>
              <span>•</span>
              <span>Gotland Wool & Italian Merino</span>
              <span>•</span>
              <span>Small Batch Copenhagen Design</span>
              <span>•</span>
              <span>Free Worldwide Express Shipping</span>
              <span>•</span>
              <span>Lifetime Garment Repair Pledge</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </section>

      {/* Mission Statement with Fade Up Animation */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <p className="eyebrow animate-fade-up">Our mission</p>
        <p className="animate-fade-up animation-delay-100 mt-6 font-display text-2xl leading-relaxed md:text-3.5xl text-foreground">
          We make a small number of pieces very well, and then we make them again. Nordhem exists
          for people who want their wardrobe to be settled rather than solved.
        </p>
        <div className="animate-fade-up animation-delay-200 mt-8">
          <Link to="/about" className="eyebrow link-underline inline-block text-foreground">
            Read our story
          </Link>
        </div>
      </section>

      {/* Category Quick-Nav Grid */}
      <section className="mx-auto max-w-[110rem] px-5 md:px-10 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: "Outerwear", count: "4 Pieces", image: products[0].imageUrl },
            { name: "Knitwear", count: "3 Pieces", image: products[2].imageUrl },
            { name: "Tops", count: "3 Pieces", image: products[5].imageUrl },
            { name: "Trousers", count: "2 Pieces", image: products[8].imageUrl },
          ].map((cat) => (
            <Link
              key={cat.name}
              to="/shop"
              className="group relative overflow-hidden bg-secondary aspect-[4/5] block border border-border/50"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent p-5 flex flex-col justify-end">
                <p className="eyebrow text-[0.65rem] text-muted-foreground">{cat.count}</p>
                <h3 className="font-display text-2xl text-foreground group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Studio Experience Grid */}
      <section className="mx-auto mt-20 max-w-[110rem] px-5 md:px-10">
        <div className="border-b border-border pb-5">
          <p className="eyebrow">Interactive Features</p>
          <h2 className="font-display text-2xl md:text-4xl mt-1">The Nordhem Studio Experience</h2>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/wardrobe-studio"
            className="group border border-border bg-card p-6 rounded-xs hover:border-foreground/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-secondary/80 text-clay border border-border rounded-xs w-fit mb-4 group-hover:bg-clay group-hover:text-clay-foreground transition-colors">
                <Layers size={20} />
              </div>
              <h3 className="font-display text-2xl text-foreground">Wardrobe Studio</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Mix and match outerwear, knitwear, and tailoring on an interactive canvas with live
                material composition.
              </p>
            </div>
            <div className="mt-6 text-xs font-medium text-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Canvas <ArrowRight size={13} />
            </div>
          </Link>

          <Link
            to="/style-quiz"
            className="group border border-border bg-card p-6 rounded-xs hover:border-foreground/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-secondary/80 text-clay border border-border rounded-xs w-fit mb-4 group-hover:bg-clay group-hover:text-clay-foreground transition-colors">
                <Sparkles size={20} />
              </div>
              <h3 className="font-display text-2xl text-foreground">Style Quiz Matcher</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Answer 3 quick questions to receive a tailored 3-piece capsule wardrobe & earn +200
                Nordic Circle points.
              </p>
            </div>
            <div className="mt-6 text-xs font-medium text-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Take Quiz <ArrowRight size={13} />
            </div>
          </Link>

          <Link
            to="/rewards"
            className="group border border-border bg-card p-6 rounded-xs hover:border-foreground/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-secondary/80 text-clay border border-border rounded-xs w-fit mb-4 group-hover:bg-clay group-hover:text-clay-foreground transition-colors">
                <Award size={20} />
              </div>
              <h3 className="font-display text-2xl text-foreground">Nordic Circle VIP</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Unlock points balance, free eco express shipping, tailor repair credits, and early
                private archive access.
              </p>
            </div>
            <div className="mt-6 text-xs font-medium text-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Perks <ArrowRight size={13} />
            </div>
          </Link>

          <Link
            to="/sustainability"
            className="group border border-border bg-card p-6 rounded-xs hover:border-foreground/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-secondary/80 text-clay border border-border rounded-xs w-fit mb-4 group-hover:bg-clay group-hover:text-clay-foreground transition-colors">
                <Leaf size={20} />
              </div>
              <h3 className="font-display text-2xl text-foreground">Eco Traceability</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Trace Gotland wool and Normandy linen origins, calculate water savings, and submit
                garment repair requests.
              </p>
            </div>
            <div className="mt-6 text-xs font-medium text-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Inspect Origins <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Collection with Staggered Card Entrance */}
      <section className="mx-auto mt-24 max-w-[110rem] px-5 md:px-10">
        <div className="flex items-end justify-between border-b border-border pb-5">
          <h2 className="font-display text-2xl md:text-3xl">Featured Collection</h2>
          <Link to="/shop" className="eyebrow link-underline text-foreground">
            View all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
          {featured.map((p, index) => (
            <div
              key={p.id}
              className="animate-fade-up"
              style={{ animationDelay: `${(index % 3) * 120}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* VIP Circle Banner */}
      <section className="mx-auto mt-24 max-w-[110rem] px-5 md:px-10">
        <VipBanner />
      </section>

      {/* Lookbook Section with Image Scale Effects */}
      <section className="mx-auto mt-28 max-w-[110rem] px-5 md:px-10">
        <div className="flex items-end justify-between border-b border-border pb-5">
          <h2 className="font-display text-2xl md:text-3xl">From the Lookbook</h2>
          <Link to="/lookbook" className="eyebrow link-underline text-foreground">
            See all looks
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {lookbook.slice(0, 4).map((l, i) => (
            <Link
              key={l.src}
              to="/lookbook"
              className="group relative overflow-hidden bg-secondary aspect-[4/5] block"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img
                src={l.src}
                alt={l.alt}
                loading="lazy"
                width={800}
                height={1008}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <span className="text-[10px] uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-3 py-1">
                  Look 0{i + 1}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mt-28 border-y border-border bg-secondary/50 px-5 py-20 text-center animate-fade-up">
        <p className="eyebrow">Stay close</p>
        <h2 className="mx-auto mt-4 max-w-md font-display text-3xl">
          Letters from the studio, four times a year.
        </h2>
        <div className="mt-8">
          <Newsletter />
        </div>
      </section>
    </div>
  );
}

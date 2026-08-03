import { createFileRoute, Link } from "@tanstack/react-router";
import look3 from "@/assets/look-3.jpg";
import look5 from "@/assets/look-5.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Nordhem" },
      {
        name: "description",
        content:
          "Nordhem was founded in Copenhagen in 2019 to make a small wardrobe well: natural fibres, small runs, named makers, no seasons to chase.",
      },
      { property: "og:title", content: "About — Nordhem" },
      {
        property: "og:description",
        content: "Our story, our values, and why we make so few things.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <p className="eyebrow">Est. Copenhagen, 2019</p>
        <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
          We started with eleven pieces and no plan to add a twelfth.
        </h1>
      </section>

      <section className="mx-auto grid max-w-[110rem] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
        <img
          src={look3}
          alt="Model seated in a linen shirt and wide trousers in a bright, quiet room"
          loading="lazy"
          width={800}
          height={1008}
          className="w-full object-cover"
        />
        <div className="max-w-md">
          <h2 className="font-display text-3xl">The story</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Nordhem began in a two-room apartment in Nørrebro, after our founder spent a decade
            producing collections she did not believe in. The first run was eleven pieces, sewn by a
            family workshop outside Porto that still makes most of what we sell.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We do not chase seasons. A piece stays in the collection until we find a way to make it
            better, and then we replace it with that version. Some styles have not changed since the
            first run. We consider that a good sign.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center md:py-32">
        <blockquote className="font-display text-2xl leading-relaxed md:text-3xl">
          “Getting dressed should be the least interesting decision of your day.”
        </blockquote>
        <p className="eyebrow mt-6">Ingrid Halvorsen — Founder</p>
      </section>

      <section className="mx-auto grid max-w-[110rem] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
        <div className="max-w-md md:order-2">
          <h2 className="font-display text-3xl">What we hold to</h2>
          <dl className="mt-8 space-y-8">
            {[
              {
                t: "Natural fibres, first",
                d: "Wool, alpaca, linen, organic cotton. Synthetics only where they genuinely outperform, and never in knitwear.",
              },
              {
                t: "Small runs",
                d: "We produce to demand rather than forecast. Pieces sell out; they usually return.",
              },
              {
                t: "Named makers",
                d: "Four workshops across Portugal, Italy and Scotland. We visit each of them twice a year.",
              },
              {
                t: "Repair before replace",
                d: "Free mending on anything we have made, for as long as we exist.",
              },
            ].map((v) => (
              <div key={v.t}>
                <dt className="text-sm">{v.t}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.d}</dd>
              </div>
            ))}
          </dl>
          <Link to="/shop" className="btn-outline mt-10">
            See the collection
          </Link>
        </div>
        <img
          src={look5}
          alt="Folded stack of neutral knitwear and linen garments on stone"
          loading="lazy"
          width={800}
          height={1008}
          className="w-full object-cover md:order-1"
        />
      </section>
    </div>
  );
}

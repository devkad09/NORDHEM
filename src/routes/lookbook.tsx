import { createFileRoute } from "@tanstack/react-router";
import { lookbook } from "@/data/products";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook — Nordhem" },
      {
        name: "description",
        content:
          "The Nordhem lookbook: neutral layers photographed on the coast, in the forest and in quiet rooms.",
      },
      { property: "og:title", content: "Lookbook — Nordhem" },
      {
        property: "og:description",
        content: "Styled looks from the current Nordhem collection.",
      },
    ],
  }),
  component: Lookbook,
});

function Lookbook() {
  return (
    <div className="mx-auto max-w-[110rem] px-5 py-14 md:px-10 md:py-20">
      <p className="eyebrow">Autumn / Winter</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">Lookbook</h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Photographed over three days on the Jutland coast and in a borrowed studio in Porto.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {lookbook.map((l, i) => (
          <figure
            key={l.src}
            className={`overflow-hidden bg-secondary ${i % 5 === 0 ? "md:row-span-2" : ""}`}
          >
            <img
              src={l.src}
              alt={l.alt}
              loading="lazy"
              width={800}
              height={1008}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.03]"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

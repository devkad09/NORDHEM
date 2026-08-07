import { useState } from "react";
import { X, SlidersHorizontal, Trash2, ArrowRight } from "lucide-react";
import { useCompare } from "@/lib/compare";
import { useCurrency } from "@/lib/currency";
import { Link } from "@tanstack/react-router";

export function CompareDrawer() {
  const { compareProducts, removeCompare, clearCompare, compareIds } = useCompare();
  const { formatPrice } = useCurrency();
  const [expanded, setExpanded] = useState(false);

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-fade-up">
      <div className="border border-border bg-card shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Summary Bar */}
        <div className="flex items-center justify-between p-4 bg-card/95">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={16} className="text-foreground" />
            <span className="eyebrow text-xs font-semibold text-foreground">
              Compare ({compareProducts.length}/3)
            </span>
            <div className="hidden sm:flex items-center gap-2">
              {compareProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 rounded bg-secondary px-2 py-1 text-xs"
                >
                  <span className="truncate max-w-[100px] font-medium">{p.name}</span>
                  <button
                    onClick={() => removeCompare(p.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="btn-solid py-1.5 px-3 text-xs uppercase tracking-wider"
            >
              {expanded ? "Hide Table" : "Compare Now"}
            </button>
            <button
              onClick={clearCompare}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear comparison"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Expanded Comparison Table */}
        {expanded && (
          <div className="border-t border-border p-5 bg-card overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 eyebrow text-muted-foreground">Piece</th>
                  {compareProducts.map((p) => (
                    <th key={p.id} className="py-3 px-4 min-w-[180px]">
                      <div className="space-y-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-28 w-20 object-cover bg-secondary"
                        />
                        <p className="font-display text-base font-normal">{p.name}</p>
                        <p className="font-medium text-foreground">{formatPrice(p.price)}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground eyebrow">
                    Category
                  </td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="py-3 px-4">
                      {p.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground eyebrow">
                    Available Sizes
                  </td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="py-3 px-4 font-mono">
                      {p.sizes.join(", ")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground eyebrow">
                    Fabric & Details
                  </td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="py-3 px-4 space-y-1">
                      {p.details.map((d, i) => (
                        <p key={i} className="text-muted-foreground">
                          • {d}
                        </p>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground eyebrow">Action</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="py-3 px-4">
                      <Link
                        to="/product/$productId"
                        params={{ productId: p.id }}
                        onClick={() => setExpanded(false)}
                        className="btn-outline py-2 px-3 text-[0.7rem] uppercase block text-center"
                      >
                        View Piece <ArrowRight size={11} className="inline ml-1" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

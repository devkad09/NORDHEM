import { Truck, CheckCircle2 } from "lucide-react";
import { useCurrency } from "@/lib/currency";

const FREE_SHIPPING_BASE_EUR = 300; // Free shipping threshold in EUR base price

export function FreeShippingBar({ subtotalEur }: { subtotalEur: number }) {
  const { currency, formatPrice } = useCurrency();

  const thresholdEur = FREE_SHIPPING_BASE_EUR;
  const remainingEur = Math.max(0, thresholdEur - subtotalEur);
  const percentage = Math.min(100, Math.round((subtotalEur / thresholdEur) * 100));

  const isUnlocked = subtotalEur >= thresholdEur;

  return (
    <div className="rounded border border-border bg-secondary/60 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between font-medium">
        <span className="flex items-center gap-1.5">
          <Truck size={14} className={isUnlocked ? "text-emerald-700" : "text-muted-foreground"} />
          {isUnlocked ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> You unlocked Free Express Shipping!
            </span>
          ) : (
            <span>
              Add <strong className="text-foreground">{formatPrice(remainingEur)}</strong> more for Free Shipping
            </span>
          )}
        </span>
        <span className="text-[0.65rem] text-muted-foreground tabular-nums">{percentage}%</span>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full transition-all duration-500 ${
            isUnlocked ? "bg-emerald-600" : "bg-foreground"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

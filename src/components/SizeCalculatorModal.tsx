import { useState } from "react";
import { X, Sparkles, Check, Calculator } from "lucide-react";

export function SizeCalculatorModal({
  onSelectSize,
  onClose,
}: {
  onSelectSize: (size: string) => void;
  onClose: () => void;
}) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [fit, setFit] = useState<"tailored" | "regular" | "oversized">("regular");
  const [calculatedSize, setCalculatedSize] = useState<string | null>(null);

  function handleCalculate() {
    let size = "M";

    if (height < 165 || weight < 60) {
      size = "XS";
    } else if (height < 172 || weight < 68) {
      size = "S";
    } else if (height < 182 || weight < 80) {
      size = "M";
    } else if (height < 190 || weight < 92) {
      size = "L";
    } else {
      size = "XL";
    }

    // Fit adjustment
    if (fit === "tailored") {
      if (size === "XL") size = "L";
      else if (size === "L") size = "M";
      else if (size === "M") size = "S";
    } else if (fit === "oversized") {
      if (size === "M") size = "L";
      else if (size === "L") size = "XL";
    }

    setCalculatedSize(size);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-up">
      <div className="relative w-full max-w-md border border-border bg-card p-6 md:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close Size Finder"
        >
          <X size={18} />
        </button>

        <div>
          <p className="eyebrow flex items-center gap-1">
            <Calculator size={13} /> Size Calculator
          </p>
          <h3 className="font-display text-2xl">Find Your Ideal Fit</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter your measurements to calculate your recommended Nordhem size.
          </p>
        </div>

        <div className="space-y-4">
          {/* Height Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="eyebrow text-[0.65rem]">Height</span>
              <span className="font-medium tabular-nums">{height} cm</span>
            </div>
            <input
              type="range"
              min={150}
              max={205}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-foreground cursor-pointer"
            />
          </div>

          {/* Weight Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="eyebrow text-[0.65rem]">Weight</span>
              <span className="font-medium tabular-nums">{weight} kg</span>
            </div>
            <input
              type="range"
              min={45}
              max={120}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-foreground cursor-pointer"
            />
          </div>

          {/* Fit Preference */}
          <div>
            <span className="eyebrow text-[0.65rem] block mb-2">Preferred Fit</span>
            <div className="grid grid-cols-3 gap-2">
              {(["tailored", "regular", "oversized"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFit(f)}
                  className={`border py-2 text-xs capitalize transition-all ${
                    fit === f
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {!calculatedSize ? (
            <button
              onClick={handleCalculate}
              className="btn-solid w-full py-3 text-xs uppercase tracking-widest mt-2"
            >
              Calculate My Size
            </button>
          ) : (
            <div className="rounded border border-border bg-secondary/80 p-4 text-center space-y-3">
              <p className="eyebrow text-[0.65rem] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                <Sparkles size={12} /> Recommendation Ready
              </p>
              <p className="font-display text-3xl">Recommended: Size {calculatedSize}</p>
              <button
                onClick={() => {
                  onSelectSize(calculatedSize);
                  onClose();
                }}
                className="btn-solid w-full py-2.5 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Select Size {calculatedSize}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

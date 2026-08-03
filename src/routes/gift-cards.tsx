import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gift, Check, Sparkles, Send, Copy } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";

export const Route = createFileRoute("/gift-cards")({
  head: () => ({
    meta: [
      { title: "Digital Gift Cards — Nordhem" },
      { name: "description", content: "Give the gift of timeless Scandinavian clothing with Nordhem digital vouchers." },
    ],
  }),
  component: GiftCardsPage,
});

const VOUCHER_AMOUNTS_EUR = [50, 100, 200, 500];

function GiftCardsPage() {
  const { formatPrice } = useCurrency();
  const [selectedEur, setSelectedEur] = useState(100);

  // Form State
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    const code = `NH-GIFT-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedCode(code);
    toast.success(`Gift card voucher generated! Code: ${code}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24 space-y-12">
      <div className="text-center space-y-3">
        <p className="eyebrow flex items-center justify-center gap-1.5">
          <Gift size={14} /> The Nordhem Voucher
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Digital Gift Cards</h1>
        <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
          Delivered instantly via email or custom digital link. Valid indefinitely across all Nordhem small-batch collections.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-12 items-start">
        {/* Preview Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative overflow-hidden border border-border bg-card p-6 shadow-xl space-y-8 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-display text-xl tracking-[0.3em]">NORDHEM</p>
                <p className="eyebrow text-[0.6rem] text-muted-foreground mt-0.5">Digital Archive Voucher</p>
              </div>
              <Sparkles size={16} className="text-amber-700" />
            </div>

            <div className="space-y-1">
              <p className="eyebrow text-[0.65rem] text-muted-foreground">Voucher Value</p>
              <p className="font-display text-4xl text-foreground font-light tabular-nums">
                {formatPrice(selectedEur)}
              </p>
            </div>

            <div className="border-t border-border pt-4 text-xs space-y-1 text-muted-foreground">
              <p>To: <strong className="text-foreground">{recipientName || "Recipient Name"}</strong></p>
              {personalNote && <p className="italic text-[0.75rem]">“{personalNote}”</p>}
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="md:col-span-7 border border-border bg-card p-6 md:p-8 space-y-6">
          {!generatedCode ? (
            <form onSubmit={handlePurchase} className="space-y-5">
              <div>
                <label className="eyebrow text-[0.65rem] block mb-2">Select Amount</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {VOUCHER_AMOUNTS_EUR.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedEur(amt)}
                      className={`border py-3 text-xs font-mono transition-all cursor-pointer ${
                        selectedEur === amt
                          ? "border-foreground bg-foreground text-background font-semibold"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {formatPrice(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freja Lindqvist"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="freja@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Personal Message (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Warmest wishes for a quiet, essential wardrobe..."
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none resize-none"
                />
              </div>

              <button type="submit" className="btn-solid w-full py-3.5 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Send size={14} /> Issue Gift Voucher ({formatPrice(selectedEur)})
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4 animate-fade-up">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={24} />
              </div>
              <h3 className="font-display text-2xl">Voucher Issued Successfully</h3>
              <p className="text-xs text-muted-foreground">
                Sent to <strong className="text-foreground">{recipientEmail}</strong>. Voucher code:
              </p>
              <div className="rounded border border-border bg-secondary p-3 text-center font-mono text-lg font-semibold tracking-wider">
                {generatedCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  toast.success("Voucher code copied!");
                }}
                className="btn-outline w-full py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Copy size={13} /> Copy Voucher Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

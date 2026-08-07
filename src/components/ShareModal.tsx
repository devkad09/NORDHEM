import { useState } from "react";
import { X, Copy, Check, Share2, Send } from "lucide-react";
import { toast } from "sonner";
import { type Product } from "@/data/products";

export function ShareModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Explore ${product.name} at Nordhem`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-up">
      <div className="relative w-full max-w-sm border border-border bg-card p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close Share Modal"
        >
          <X size={18} />
        </button>

        <div>
          <p className="eyebrow flex items-center gap-1">
            <Share2 size={13} /> Share Piece
          </p>
          <h3 className="font-display text-xl">{product.name}</h3>
        </div>

        {/* Copy Link Input */}
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full border border-border bg-background py-2 px-3 text-xs text-muted-foreground focus:outline-none"
          />
          <button onClick={handleCopy} className="btn-solid px-3 text-xs flex items-center gap-1">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border p-2.5 text-center text-xs hover:border-foreground transition-colors flex items-center justify-center gap-1.5"
          >
            <Send size={13} /> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border p-2.5 text-center text-xs hover:border-foreground transition-colors flex items-center justify-center gap-1.5"
          >
            X / Twitter
          </a>
        </div>
      </div>
    </div>
  );
}

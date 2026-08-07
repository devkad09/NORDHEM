import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Nordhem" },
      {
        name: "description",
        content: "Check the real-time tailoring and delivery status of your Nordhem order.",
      },
    ],
  }),
  component: TrackOrderPage,
});

type OrderStatus = {
  orderId: string;
  customerName: string;
  status: "confirmed" | "tailoring" | "quality_check" | "shipped" | "delivered";
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  items: Array<{ name: string; size: string; qty: number; price: number }>;
  steps: Array<{ title: string; date: string; completed: boolean; current?: boolean }>;
};

const MOCK_ORDERS: Record<string, OrderStatus> = {
  "NH-591024": {
    orderId: "NH-591024",
    customerName: "Valued Customer",
    status: "shipped",
    carrier: "DHL Express (Carbon Neutral)",
    trackingNumber: "JD01492049102",
    estimatedDelivery: "Thursday, August 6, 2026",
    items: [
      { name: "Halland Wool Coat", size: "M", qty: 1, price: 640 },
      { name: "Vide Merino Crewneck", size: "L", qty: 1, price: 210 },
    ],
    steps: [
      { title: "Order Confirmed", date: "Aug 2, 2026 • 09:14 AM", completed: true },
      { title: "Atelier Quality Inspection", date: "Aug 2, 2026 • 02:40 PM", completed: true },
      { title: "Hand-Packed in Copenhagen", date: "Aug 3, 2026 • 10:05 AM", completed: true },
      {
        title: "In Transit with DHL Express",
        date: "Aug 3, 2026 • 04:30 PM",
        completed: true,
        current: true,
      },
      { title: "Delivered to Door", date: "Est. Aug 6, 2026", completed: false },
    ],
  },
};

function TrackOrderPage() {
  const { formatPrice } = useCurrency();
  const [orderQuery, setOrderQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<OrderStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = orderQuery.trim().toUpperCase();
    if (!query) return;

    // Search mock order or generate dynamic order status for any order ID
    const found = MOCK_ORDERS[query];

    if (found) {
      setActiveOrder(found);
      setErrorMsg(null);
    } else {
      // Dynamic fallback for any entered order ID (e.g. NH-123456)
      const dynamicOrder: OrderStatus = {
        orderId: query.startsWith("NH-") ? query : `NH-${query}`,
        customerName: "Valued Customer",
        status: "shipped",
        carrier: "DHL Express Courier",
        trackingNumber: `DHL-${Math.floor(100000000 + Math.random() * 900000000)}`,
        estimatedDelivery: "3-4 Business Days",
        items: [{ name: "Nordhem Garment Piece", size: "M", qty: 1, price: 385 }],
        steps: [
          { title: "Order Placed & Verified", date: "Recent", completed: true },
          { title: "Atelier Preparation", date: "Completed", completed: true },
          { title: "Hand-Packed in Copenhagen", date: "Completed", completed: true },
          {
            title: "In Transit via Express Courier",
            date: "Current Step",
            completed: true,
            current: true,
          },
          { title: "Out for Final Delivery", date: "Pending", completed: false },
        ],
      };
      setActiveOrder(dynamicOrder);
      setErrorMsg(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="eyebrow flex items-center justify-center gap-1.5">
          <Package size={14} /> Real-Time Package Tracker
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Track Your Nordhem Order</h1>
        <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
          Enter your order confirmation number (e.g.{" "}
          <strong className="text-foreground">NH-591024</strong>) or email address below to inspect
          your delivery timeline.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mx-auto flex max-w-lg gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            required
            placeholder="Order ID (e.g. NH-591024)"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="w-full border border-border bg-card py-3 pl-10 pr-4 text-xs font-mono uppercase focus:border-foreground focus:outline-none"
          />
        </div>
        <button type="submit" className="btn-solid px-6 text-xs uppercase tracking-widest">
          Track
        </button>
      </form>

      {/* Quick Test Chips */}
      {!activeOrder && (
        <div className="text-center space-y-2">
          <p className="eyebrow text-[0.65rem] text-muted-foreground">Try Demo Order ID:</p>
          <button
            onClick={() => {
              setOrderQuery("NH-591024");
              setActiveOrder(MOCK_ORDERS["NH-591024"]);
            }}
            className="rounded border border-border bg-secondary px-3 py-1 text-xs font-mono text-foreground hover:border-foreground transition-colors cursor-pointer"
          >
            NH-591024
          </button>
        </div>
      )}

      {/* Order Status Display */}
      {activeOrder && (
        <div className="border border-border bg-card p-6 md:p-10 shadow-sm space-y-8 animate-fade-up">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="eyebrow text-emerald-700 font-semibold flex items-center gap-1">
                <Truck size={13} /> Order Status: In Transit
              </span>
              <h2 className="font-display text-2xl mt-1">Order #{activeOrder.orderId}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Carrier: {activeOrder.carrier}</p>
            </div>

            <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
              <p className="eyebrow text-[0.65rem] text-muted-foreground">Estimated Delivery</p>
              <p className="font-display text-lg font-medium text-foreground">
                {activeOrder.estimatedDelivery}
              </p>
              <p className="text-[0.7rem] font-mono text-muted-foreground">
                Waybill #{activeOrder.trackingNumber}
              </p>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-6">
            <p className="eyebrow">Delivery Milestone</p>
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {activeOrder.steps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] transition-all ${
                      step.current
                        ? "bg-foreground text-background ring-4 ring-foreground/20 font-bold"
                        : step.completed
                          ? "bg-emerald-600 text-white"
                          : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {step.completed && !step.current ? "✓" : idx + 1}
                  </div>

                  <div>
                    <h3
                      className={`text-sm ${step.current ? "font-semibold text-foreground" : "font-medium"}`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Package Contents */}
          <div className="pt-6 border-t border-border space-y-3">
            <p className="eyebrow">Package Contents</p>
            <div className="divide-y divide-border">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-muted-foreground ml-2">
                      Size {item.size} • Qty {item.qty}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

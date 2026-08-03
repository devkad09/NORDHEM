import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ArrowLeft, ShieldCheck, Truck, CreditCard, Tag, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { z } from "zod";

const searchSchema = z.object({
  promo: z.string().optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Checkout — Nordhem" },
      { name: "description", content: "Complete your order with Nordhem." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type ShippingMethod = "standard" | "express";

type OrderDetails = {
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    size: string;
    qty: number;
    price: number;
    imageUrl: string;
  }>;
};

const PROMO_CODES: Record<string, { label: string; percent?: number; freeShipping?: boolean }> = {
  NORDHEM10: { label: "10% OFF", percent: 10 },
  WELCOME20: { label: "20% OFF", percent: 20 },
  FREESHIP: { label: "Free Express Shipping", freeShipping: true },
};

function CheckoutPage() {
  const { detailed, subtotal, clear } = useCart();
  const { formatPrice } = useCurrency();
  const search = Route.useSearch();

  const initialPromo = search.promo ? search.promo.toUpperCase() : null;
  const [promoCode, setPromoCode] = useState<string | null>(initialPromo && PROMO_CODES[initialPromo] ? initialPromo : null);

  // Form State
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Sweden");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderDetails | null>(null);

  const promoInfo = promoCode ? PROMO_CODES[promoCode] : null;
  const discountAmount = promoInfo?.percent ? subtotal * (promoInfo.percent / 100) : 0;
  const rawShippingCost = shippingMethod === "express" ? 25 : 0;
  const shippingCost = promoInfo?.freeShipping ? 0 : rawShippingCost;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detailed.length === 0) return;

    setIsSubmitting(true);

    // Simulate order placement
    setTimeout(() => {
      const orderData: OrderDetails = {
        orderId: `NH-${Math.floor(100000 + Math.random() * 900000)}`,
        email: email || "customer@nordhem.com",
        firstName: firstName || "Valued",
        lastName: lastName || "Customer",
        address: address || "Strandvägen 12",
        city: city || "Stockholm",
        postalCode: postalCode || "114 56",
        country,
        shippingMethod,
        shippingCost,
        total,
        items: detailed.map((l) => ({
          id: l.id,
          name: l.product.name,
          size: l.size,
          qty: l.qty,
          price: l.product.price,
          imageUrl: l.product.imageUrl,
        })),
      };

      setOrderConfirmed(orderData);
      clear();
      setIsSubmitting(false);
    }, 1200);
  };

  // Order Confirmation State
  if (orderConfirmed) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <div className="border border-border bg-card p-8 md:p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-foreground">
            <CheckCircle2 className="h-10 w-10 text-foreground" />
          </div>

          <p className="eyebrow mt-6 text-muted-foreground">Order Confirmed</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Thank you for your order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order <span className="font-mono font-medium text-foreground">#{orderConfirmed.orderId}</span> has been placed. A confirmation email was sent to <span className="text-foreground">{orderConfirmed.email}</span>.
          </p>

          <div className="my-10 border-t border-border pt-8 text-left">
            <h2 className="eyebrow mb-4">Summary</h2>
            <div className="divide-y divide-border">
              {orderConfirmed.items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center justify-between py-3 text-sm">
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="h-12 w-10 object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size {item.size} • Qty {item.qty}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium tabular-nums">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping ({orderConfirmed.shippingMethod === "express" ? "Express" : "Standard"})</span>
                <span>{orderConfirmed.shippingCost === 0 ? "Complimentary" : formatPrice(orderConfirmed.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                <span>Total Paid</span>
                <span className="tabular-nums">{formatPrice(orderConfirmed.total)}</span>
              </div>
            </div>

            <div className="mt-6 rounded bg-secondary/50 p-4 text-xs">
              <p className="font-medium text-foreground">Shipping Address</p>
              <p className="mt-1 text-muted-foreground">
                {orderConfirmed.firstName} {orderConfirmed.lastName}<br />
                {orderConfirmed.address}<br />
                {orderConfirmed.postalCode} {orderConfirmed.city}, {orderConfirmed.country}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shop" className="btn-solid min-w-[200px]">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-outline min-w-[200px]">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart check (before confirmation)
  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn-outline mt-8 inline-block">
          Explore collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
      <div className="mb-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Return to cart
        </Link>
        <h1 className="mt-4 font-display text-3xl md:text-4xl">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-10">
          {/* Contact Information */}
          <section className="space-y-4">
            <h2 className="eyebrow border-b border-border pb-2">1. Contact Information</h2>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </section>

          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="eyebrow border-b border-border pb-2">2. Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street name and house number"
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                >
                  <option value="Sweden">Sweden</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Norway">Norway</option>
                  <option value="Finland">Finland</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                </select>
              </div>
            </div>
          </section>

          {/* Delivery Options */}
          <section className="space-y-4">
            <h2 className="eyebrow border-b border-border pb-2">3. Delivery Method</h2>
            <div className="space-y-3">
              <label
                className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${
                  shippingMethod === "standard" ? "border-foreground bg-secondary/30" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                  />
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" /> Standard Courier (3-5 business days)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Climate neutral delivery</p>
                  </div>
                </div>
                <span className="text-sm font-medium">Complimentary</span>
              </label>

              <label
                className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${
                  shippingMethod === "express" ? "border-foreground bg-secondary/30" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                  />
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" /> Express Courier (1-2 business days)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Priority handling & tracked shipping</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{formatPrice(25)}</span>
              </label>
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h2 className="eyebrow border-b border-border pb-2">4. Payment</h2>
            <div className="space-y-3">
              <label
                className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${
                  paymentMethod === "card" ? "border-foreground bg-secondary/30" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" /> Credit / Debit Card
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Visa, Mastercard, Amex</span>
              </label>

              {paymentMethod === "card" && (
                <div className="border border-border p-4 bg-card space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8901"
                      className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-solid w-full py-4 text-center text-sm uppercase tracking-wider"
            >
              {isSubmitting ? "Processing Order..." : `Complete Order — ${formatPrice(total)}`}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> 256-bit SSL Encrypted Payment Guarantee
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 border border-border bg-card p-6 md:p-8">
            <h2 className="eyebrow border-b border-border pb-4">Order Summary</h2>

            <div className="divide-y divide-border max-h-96 overflow-y-auto pr-1">
              {detailed.map((line) => (
                <div key={`${line.id}-${line.size}`} className="flex gap-4 py-4">
                  <img
                    src={line.product.imageUrl}
                    alt={line.product.name}
                    className="h-20 w-16 object-cover bg-secondary"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium">{line.product.name}</p>
                      <p className="eyebrow mt-1 text-xs text-muted-foreground">
                        Size {line.size} • Qty {line.qty}
                      </p>
                    </div>
                    <p className="text-sm tabular-nums">{formatPrice(line.product.price * line.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Complimentary" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="text-xs text-muted-foreground">Included</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

import raw from "./products.json";

import coat from "@/assets/products/coat.jpg";
import quilted from "@/assets/products/quilted.jpg";
import waxedJacket from "@/assets/products/waxed-jacket.png";
import shearlingJacket from "@/assets/products/shearling-jacket.png";
import crewneck from "@/assets/products/crewneck.jpg";
import cardigan from "@/assets/products/cardigan.jpg";
import turtleneck from "@/assets/products/turtleneck.jpg";
import linenShirt from "@/assets/products/linen-shirt.jpg";
import poplinShirt from "@/assets/products/poplin-shirt.jpg";
import tee from "@/assets/products/tee.jpg";
import wideTrouser from "@/assets/products/wide-trouser.jpg";
import taperedTrouser from "@/assets/products/tapered-trouser.jpg";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";
import look4 from "@/assets/look-4.jpg";
import look5 from "@/assets/look-5.jpg";
import look6 from "@/assets/look-6.jpg";

export const imageMap: Record<string, string | undefined> = {
  coat,
  quilted,
  "waxed-jacket": waxedJacket,
  "shearling-jacket": shearlingJacket,
  crewneck,
  cardigan,
  turtleneck,
  "linen-shirt": linenShirt,
  "poplin-shirt": poplinShirt,
  tee,
  "wide-trouser": wideTrouser,
  "tapered-trouser": taperedTrouser,
  "look-1": look1,
  "look-2": look2,
  "look-3": look3,
  "look-4": look4,
  "look-5": look5,
  "look-6": look6,
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  hoverImage: string;
  sizes: string[];
  outOfStockSizes?: string[];
  description: string;
  details: string[];
  featured: boolean;
  imageUrl: string;
  hoverImageUrl: string;
};

export const products: Product[] = (raw as Omit<Product, "imageUrl" | "hoverImageUrl">[]).map(
  (p) => ({
    ...p,
    outOfStockSizes: p.outOfStockSizes ?? (p.id.endsWith("coat") ? ["XL"] : p.id.endsWith("jacket") ? ["XS"] : p.id.includes("wide") ? ["24"] : []),
    imageUrl: imageMap[p.image] ?? coat,
    hoverImageUrl: imageMap[p.hoverImage] ?? coat,
  }),
);

export const categories = Array.from(new Set(products.map((p) => p.category)));

export const getProduct = (id: string) => products.find((p) => p.id === id);

// Conversion rate from EUR base price to Ghanaian Cedis (GHS)
export const EUR_TO_GHS_RATE = 17.5;

export const formatPrice = (value: number) => {
  const amountInCedis = Math.round(value * EUR_TO_GHS_RATE);
  return `GH₵${amountInCedis.toLocaleString("en-US")}`;
};

export const lookbook = [
  { src: look1, alt: "Model in layered oatmeal knitwear on a Nordic coastline" },
  { src: look2, alt: "Close detail of a hand in the pocket of a sand wool coat" },
  { src: look3, alt: "Model seated on a pale wooden bench in linen shirt and wide trousers" },
  { src: look4, alt: "Back view of a charcoal ribbed turtleneck against a plaster wall" },
  { src: look5, alt: "Folded stack of neutral knitwear and linen on stone" },
  { src: look6, alt: "Model in a taupe quilted jacket in a foggy pine forest" },
];

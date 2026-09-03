import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  type LookbookItem,
  type AdminOrder,
  type AuditLogItem,
  getStoredProducts,
  getStoredLookbook,
  getStoredOrders,
  getAuditLogs,
  updateOrderStatus as dbUpdateOrderStatus,
  createStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  resetStoredProducts,
  saveStoredLookbook,
  onDatabaseChange,
  notifyDatabaseChanged,
} from "./database";
import { type Product, products as seedProducts, lookbook as seedLookbook } from "@/data/products";

interface ProductsContextType {
  products: Product[];
  categories: string[];
  getProduct: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, "id"> & { id?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => Product;
  deleteProduct: (id: string) => boolean;
  resetProducts: () => Product[];
  refreshProducts: () => void;
  isLoaded: boolean;
}

interface LookbookContextType {
  lookbook: LookbookItem[];
  addLookbookItem: (item: Omit<LookbookItem, "id"> & { id?: string }) => LookbookItem;
  updateLookbookItem: (id: string, updates: Partial<LookbookItem>) => LookbookItem;
  deleteLookbookItem: (id: string) => boolean;
  resetLookbook: () => LookbookItem[];
}

interface OrdersContextType {
  orders: AdminOrder[];
  auditLogs: AuditLogItem[];
  updateStatus: (id: string, status: AdminOrder["status"]) => void;
  refreshOrders: () => void;
}

const ProductsContext = createContext<ProductsContextType | null>(null);
const LookbookContext = createContext<LookbookContextType | null>(null);
const OrdersContext = createContext<OrdersContextType | null>(null);

export function ProductsStoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      return getStoredProducts();
    }
    return seedProducts;
  });

  const [lookbook, setLookbook] = useState<LookbookItem[]>(() => {
    if (typeof window !== "undefined") {
      return getStoredLookbook();
    }
    return seedLookbook.map((item, i) => ({
      id: `look-${i + 1}`,
      src: item.src,
      alt: item.alt,
      caption: item.alt,
      season: "Autumn / Winter 2026",
    }));
  });

  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    if (typeof window !== "undefined") {
      return getStoredOrders();
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    if (typeof window !== "undefined") {
      return getAuditLogs();
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const refreshProducts = useCallback(() => {
    setProducts(getStoredProducts());
    setAuditLogs(getAuditLogs());
  }, []);

  const refreshLookbook = useCallback(() => {
    setLookbook(getStoredLookbook());
  }, []);

  const refreshOrders = useCallback(() => {
    setOrders(getStoredOrders());
    setAuditLogs(getAuditLogs());
  }, []);

  useEffect(() => {
    refreshProducts();
    refreshLookbook();
    refreshOrders();
    setIsLoaded(true);

    const unsubscribe = onDatabaseChange((type) => {
      if (type === "products" || type === "all") {
        refreshProducts();
      }
      if (type === "lookbook" || type === "all") {
        refreshLookbook();
      }
      if (type === "orders" || type === "all") {
        refreshOrders();
      }
    });

    return () => unsubscribe();
  }, [refreshProducts, refreshLookbook, refreshOrders]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const getProduct = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products],
  );

  const addProduct = useCallback((product: Omit<Product, "id"> & { id?: string }) => {
    const created = createStoredProduct(product);
    setProducts(getStoredProducts());
    setAuditLogs(getAuditLogs());
    return created;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updated = updateStoredProduct(id, updates);
    setProducts(getStoredProducts());
    setAuditLogs(getAuditLogs());
    return updated;
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const deleted = deleteStoredProduct(id);
    if (deleted) {
      setProducts(getStoredProducts());
      setAuditLogs(getAuditLogs());
    }
    return deleted;
  }, []);

  const resetProducts = useCallback(() => {
    const reset = resetStoredProducts();
    setProducts(reset);
    setAuditLogs(getAuditLogs());
    return reset;
  }, []);

  // Lookbook methods
  const addLookbookItem = useCallback((item: Omit<LookbookItem, "id"> & { id?: string }) => {
    const current = getStoredLookbook();
    const id = item.id || `look-${Date.now()}`;
    const newItem: LookbookItem = { ...item, id };
    const updated = [newItem, ...current];
    saveStoredLookbook(updated);
    setLookbook(updated);
    return newItem;
  }, []);

  const updateLookbookItem = useCallback((id: string, updates: Partial<LookbookItem>) => {
    const current = getStoredLookbook();
    const index = current.findIndex((l) => l.id === id);
    if (index === -1) throw new Error("Lookbook item not found");
    const updatedItem = { ...current[index], ...updates };
    current[index] = updatedItem;
    saveStoredLookbook(current);
    setLookbook([...current]);
    return updatedItem;
  }, []);

  const deleteLookbookItem = useCallback((id: string) => {
    const current = getStoredLookbook();
    const filtered = current.filter((l) => l.id !== id);
    if (filtered.length === current.length) return false;
    saveStoredLookbook(filtered);
    setLookbook(filtered);
    return true;
  }, []);

  const resetLookbook = useCallback(() => {
    const defaultItems: LookbookItem[] = seedLookbook.map((item, i) => ({
      id: `look-${i + 1}`,
      src: item.src,
      alt: item.alt,
      caption: item.alt,
      season: "Autumn / Winter 2026",
    }));
    saveStoredLookbook(defaultItems);
    setLookbook(defaultItems);
    notifyDatabaseChanged("lookbook");
    return defaultItems;
  }, []);

  const updateStatus = useCallback((id: string, status: AdminOrder["status"]) => {
    dbUpdateOrderStatus(id, status);
    setOrders(getStoredOrders());
    setAuditLogs(getAuditLogs());
  }, []);

  const productsValue = useMemo<ProductsContextType>(
    () => ({
      products,
      categories,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      resetProducts,
      refreshProducts,
      isLoaded,
    }),
    [
      products,
      categories,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      resetProducts,
      refreshProducts,
      isLoaded,
    ],
  );

  const lookbookValue = useMemo<LookbookContextType>(
    () => ({
      lookbook,
      addLookbookItem,
      updateLookbookItem,
      deleteLookbookItem,
      resetLookbook,
    }),
    [lookbook, addLookbookItem, updateLookbookItem, deleteLookbookItem, resetLookbook],
  );

  const ordersValue = useMemo<OrdersContextType>(
    () => ({
      orders,
      auditLogs,
      updateStatus,
      refreshOrders,
    }),
    [orders, auditLogs, updateStatus, refreshOrders],
  );

  return (
    <ProductsContext.Provider value={productsValue}>
      <LookbookContext.Provider value={lookbookValue}>
        <OrdersContext.Provider value={ordersValue}>{children}</OrdersContext.Provider>
      </LookbookContext.Provider>
    </ProductsContext.Provider>
  );
}

export function useProductsStore() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProductsStore must be used within a ProductsStoreProvider");
  }
  return context;
}

export function useProduct(id: string) {
  const { products } = useProductsStore();
  return useMemo(() => products.find((p) => p.id === id), [products, id]);
}

export function useLookbookStore() {
  const context = useContext(LookbookContext);
  if (!context) {
    throw new Error("useLookbookStore must be used within a ProductsStoreProvider");
  }
  return context;
}

export function useOrdersStore() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrdersStore must be used within a ProductsStoreProvider");
  }
  return context;
}

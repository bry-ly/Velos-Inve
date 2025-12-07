"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductSearch } from "@/components/sales/product-search";
import { Cart, type CartItem } from "@/components/sales/cart";
import { CheckoutSummary } from "@/components/sales/checkout-summary";
import { createSale, getSaleDetails } from "@/lib/action/sales";
import { ProductService } from "@/lib/services/product-service";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  ReceiptModal,
  type ReceiptData,
} from "@/components/sales/receipt-modal";

export default function CreateSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // React 19.2: useTransition for non-blocking product loading
  const [isLoadingProducts, startProductTransition] = useTransition();

  // Memoized product loader function
  const loadProducts = useCallback(() => {
    startProductTransition(async () => {
      try {
        console.log(" Fetching products for create sale...");
        setProductError(null);

        const result = await ProductService.getProducts();

        console.log(" Product fetch result:", result);

        if (result.success && result.data) {
          console.log(` Successfully loaded ${result.data.length} products`);
          setProducts(result.data);
        } else {
          const errorMsg = result.error || "Failed to load products";
          console.error(" Product fetch failed:", errorMsg);
          setProductError(errorMsg.toString());
          toast.error("Failed to load products");
        }
      } catch (error) {
        console.error(" Exception while fetching products:", error);
        setProductError("An unexpected error occurred");
        toast.error("Failed to load products");
      }
    });
  }, []);

  // Fetch products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error(`Cannot add more. Only ${product.quantity} in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const handleCheckout = async (
    customer: string,
    paymentMethod: string,
    discount: number,
    taxRate: number,
    notes: string
  ) => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createSale({
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.price),
          discount: 0, // Item discount (can be extended later)
        })),
        customer: customer || undefined,
        paymentMethod,
        overallDiscount: discount,
        taxRate,
        notes: notes || undefined,
      });

      if (result.success && result.data) {
        toast.success("Sale completed successfully");

        // Fetch full sale details for receipt
        const saleDetails = await getSaleDetails(result.data.saleId);
        if (saleDetails.success && saleDetails.data) {
          setReceiptData(saleDetails.data);
          setShowReceipt(true);
        }

        setCartItems([]);
        router.refresh();
        // Refresh products to update stock using transition
        loadProducts();
      } else {
        toast.error(result.message || "Failed to create sale");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock user for sidebar since this is a client component
  // In a real app, we'd pass this from a server component wrapper or use a context
  const userSidebar = {
    name: "User",
    email: "",
    avatar: "/avatars/placeholder.svg",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={userSidebar} />
      <SidebarInset>
        <SiteHeader title="Create Sale" />
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Column: Product Search and List */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <ProductSearch
                onAddToCart={handleAddToCart}
                products={products}
                isLoading={isLoadingProducts}
                error={productError}
              />
              <div className="flex-1">
                <Cart
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="md:col-span-1">
              <CheckoutSummary
                total={totalAmount}
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
                disabled={cartItems.length === 0}
              />
            </div>
          </div>
        </main>

        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          receiptData={receiptData}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

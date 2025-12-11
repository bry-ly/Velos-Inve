"use client";

import { useState, useTransition } from "react";
import { ProductSearch } from "@/components/sales/product-search";
import { Cart, type CartItem } from "@/components/sales/cart";
import { CheckoutSummary } from "@/components/sales/checkout-summary";
import { createSale, getSaleDetails } from "@/lib/action/sales";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  ReceiptModal,
  type ReceiptData,
} from "@/components/sales/receipt-modal";

interface CreateSaleFormProps {
  initialProducts: Product[];
}

export function CreateSaleForm({ initialProducts }: CreateSaleFormProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use router refresh for product updates instead of manual fetch
  const [isRefreshing, startRefreshTransition] = useTransition();

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

        // Refresh products to update stock using transition
        startRefreshTransition(() => {
          router.refresh();
        });
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Product Search and List */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <ProductSearch
            onAddToCart={handleAddToCart}
            products={initialProducts}
            isLoading={isRefreshing}
            error={null}
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

      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        receiptData={receiptData}
      />
    </>
  );
}

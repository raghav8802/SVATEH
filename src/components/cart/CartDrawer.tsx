"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  Lock,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { useEffect } from "react";
import {
  getFreeShippingThreshold,
  useCartStore,
} from "@/store/useCartStore";

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const threshold = getFreeShippingThreshold();
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  const shippingUnlocked = remaining === 0;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-svate-beige/50 px-6 py-5">
              <h2 className="font-serif text-2xl font-medium text-svate-espresso">
                Your Bag ({itemCount} {itemCount === 1 ? "Item" : "Items"})
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="text-svate-espresso/70 transition-colors hover:text-svate-espresso"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Free shipping progress */}
            <div className="bg-[#F8F6F2] px-6 py-4">
              <p className="mb-2 text-xs text-svate-espresso/80 sm:text-sm">
                {shippingUnlocked
                  ? "You've unlocked FREE Shipping!"
                  : `You're ${formatINR(remaining)} away from FREE Shipping!`}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-svate-beige/60">
                <div
                  className="h-full rounded-full bg-[#C8A66A] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-grow space-y-6 overflow-y-auto p-6">
              {items.length === 0 ? (
                <p className="py-12 text-center text-sm text-svate-mocha">
                  Your bag is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-svate-beige">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-base text-svate-espresso">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-svate-mocha">
                            {item.shade}
                          </p>
                          <p className="mt-1 text-sm font-medium text-svate-espresso">
                            {formatINR(item.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="text-svate-taupe transition-colors hover:text-svate-espresso"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="mt-3 flex w-fit items-center gap-3 rounded-lg border border-svate-beige px-2.5 py-1.5">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="text-svate-espresso/70 hover:text-svate-espresso"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <span className="min-w-[1rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="text-svate-espresso/70 hover:text-svate-espresso"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="space-y-4 border-t border-svate-beige/50 bg-[#F8F6F2] p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-svate-mocha">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-svate-mocha">
                  <span>Shipping</span>
                  <span className="font-medium text-svate-gold">
                    {shippingUnlocked ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-svate-beige/50 pt-2 text-lg font-semibold text-svate-espresso">
                  <span>Total</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-[#C8A66A] py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#b89559]"
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="w-full text-center text-sm text-svate-espresso/70 underline-offset-4 transition-colors hover:text-svate-gold hover:underline"
              >
                Continue Shopping
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-[10px] uppercase tracking-wide text-svate-taupe">
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3 w-3 text-svate-gold" strokeWidth={1.5} />
                  100% Secure Checkout
                </span>
                <span aria-hidden="true">|</span>
                <span className="inline-flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-svate-gold" strokeWidth={1.5} />
                  COD Available
                </span>
                <span aria-hidden="true">|</span>
                <span className="inline-flex items-center gap-1">
                  <RotateCcw className="h-3 w-3 text-svate-gold" strokeWidth={1.5} />
                  Easy 15-Day Returns
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CartLineInput, Quote } from "@svateh/core";

const STORAGE_KEY = "svateh_bag_v1";

type Stored = { lines: CartLineInput[]; couponCode: string };

type CartCtx = {
  lines: CartLineInput[];
  couponCode: string;
  quote: Quote | null;
  loading: boolean;
  ready: boolean;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: CartLineInput, opts?: { silent?: boolean }) => void;
  addMany: (lines: CartLineInput[]) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  setCoupon: (code: string) => void;
  toast: string | null;
  notify: (msg: string) => void;
};

const Ctx = createContext<CartCtx | null>(null);

const sameLine = (a: CartLineInput, b: CartLineInput) => {
  if (a.kind !== b.kind) return false;
  if (a.kind === "product" && b.kind === "product") return a.productId === b.productId && a.sku === b.sku;
  const sa = "selections" in a ? a.selections.map((s) => s.sku).join(",") : "";
  const sb = "selections" in b ? b.selections.map((s) => s.sku).join(",") : "";
  if (a.kind === "bundle" && b.kind === "bundle") return a.bundleId === b.bundleId && sa === sb;
  return sa === sb;
};

const maxQty = (l: CartLineInput) => (l.kind === "product" ? 20 : l.kind === "bundle" ? 10 : 5);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>({ lines: [], couponCode: "" });
  const [ready, setReady] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reqId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        if (Array.isArray(parsed.lines)) setState({ lines: parsed.lines, couponCode: parsed.couponCode ?? "" });
      }
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  // Re-price on every change. Prices always come from the server.
  useEffect(() => {
    if (!ready) return;
    if (!state.lines.length) {
      setQuote(null);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/cart/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: state.lines, couponCode: state.couponCode }),
        });
        const data = await res.json();
        if (id === reqId.current && res.ok) setQuote(data);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [state, ready]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback((line: CartLineInput, opts?: { silent?: boolean }) => {
    setState((s) => {
      const i = s.lines.findIndex((l) => sameLine(l, line));
      if (i === -1) return { ...s, lines: [...s.lines, line] };
      const lines = [...s.lines];
      const cur = lines[i]!;
      lines[i] = { ...cur, qty: Math.min(maxQty(cur), cur.qty + line.qty) } as CartLineInput;
      return { ...s, lines };
    });
    if (!opts?.silent) setOpen(true);
  }, []);

  const addMany = useCallback(
    (lines: CartLineInput[]) => {
      lines.forEach((l) => add(l, { silent: true }));
      setOpen(true);
    },
    [add],
  );

  const setQty = useCallback((index: number, qty: number) => {
    setState((s) => {
      const lines = [...s.lines];
      const cur = lines[index];
      if (!cur) return s;
      if (qty < 1) lines.splice(index, 1);
      else lines[index] = { ...cur, qty: Math.min(maxQty(cur), qty) } as CartLineInput;
      return { ...s, lines };
    });
  }, []);

  const remove = useCallback((index: number) => setState((s) => ({ ...s, lines: s.lines.filter((_, i) => i !== index) })), []);
  const clear = useCallback(() => setState({ lines: [], couponCode: "" }), []);
  const setCoupon = useCallback((code: string) => setState((s) => ({ ...s, couponCode: code.trim().toUpperCase() })), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines: state.lines,
      couponCode: state.couponCode,
      quote,
      loading,
      ready,
      count: state.lines.reduce((n, l) => n + l.qty, 0),
      open,
      setOpen,
      add,
      addMany,
      setQty,
      remove,
      clear,
      setCoupon,
      toast,
      notify,
    }),
    [state, quote, loading, ready, open, add, addMany, setQty, remove, clear, setCoupon, toast, notify],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

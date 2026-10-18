"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";

export type NavGroup = { title: string; items: { label: string; href: string; badge?: number }[] };

export function AdminNav({ groups, brand, admin }: { groups: NavGroup[]; brand: string; admin: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

  const nav = (
    <nav className="flex h-full flex-col overflow-y-auto px-3 pb-6" aria-label="Admin">
      {groups.map((g) => (
        <div key={g.title} className="mt-5">
          {g.title ? <p className="px-3 pb-1.5 text-[10px] tracking-[0.2em] text-white/40 uppercase">{g.title}</p> : null}
          {g.items.map((it) => (
            <Link key={it.href} href={it.href} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${active(it.href) ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
              {it.label}
              {it.badge ? <span className="rounded-full bg-blush px-2 text-[10px] font-semibold text-plum">{it.badge}</span> : null}
            </Link>
          ))}
        </div>
      ))}
      <div className="mt-auto border-t border-white/10 px-3 pt-4 text-xs text-white/60">
        <Link href="/admin/account" className="block truncate hover:text-white">{admin.name || admin.email}</Link>
        <p className="capitalize text-white/40">{admin.role}</p>
        <div className="mt-3 flex gap-4">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
            <ExternalLink className="h-3 w-3" /> Store
          </a>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="inline-flex items-center gap-1 hover:text-white"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="flex h-14 items-center justify-between bg-plum px-4 text-white lg:hidden print:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-display text-lg tracking-[0.16em]">{brand}</span>
        <span className="w-6" />
      </div>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-plum text-white lg:flex print:hidden">
        <Link href="/admin" className="px-6 pt-6 font-display text-2xl tracking-[0.16em]">
          {brand} <span className="align-middle text-[9px] tracking-[0.2em] text-gold">ADMIN</span>
        </Link>
        {nav}
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-plum text-white">
            <div className="flex items-center justify-between px-6 pt-5">
              <span className="font-display text-2xl tracking-[0.16em]">{brand}</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}

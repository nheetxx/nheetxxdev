"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavItem } from "@/types";
import { SidebarNav } from "./SidebarNav";

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-sidebar px-5 shadow-sm">
        <Link href="/" className="font-mono text-sm tracking-tight">
          nheetxx<span className="text-fg">_</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          className="terminal-control border border-line px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <>
          <div
            className="mobile-nav-overlay-in fixed inset-0 z-40 bg-bg/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-drawer"
            aria-label="Main navigation"
            className="mobile-nav-drawer-in fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-sidebar px-4 py-6 shadow-xl"
          >
            <p className="mb-8 px-3 font-mono text-sm">
              nheetxx<span className="text-fg">_</span>
            </p>
            <SidebarNav items={items} onNavigate={() => setOpen(false)} />
          </nav>
        </>
      )}
    </div>
  );
}

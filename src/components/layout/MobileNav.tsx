"use client";
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className={`terminal-control fixed top-4 z-[60] grid size-10 place-items-center border border-line bg-sidebar text-accent shadow-sm transition-[left] duration-200 hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          open ? "left-[17rem]" : "left-4"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

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

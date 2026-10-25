"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types";

const norm = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

export function SidebarNav({
  items,
  onNavigate,
}: {
  items: readonly NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = norm(usePathname() ?? "/");
  return (
    <ul className="flex flex-col gap-1">
      {items.map((n) => {
        const active = norm(n.href) === pathname;
        return (
          <li key={n.href}>
            <Link
              href={n.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`terminal-control block border-l-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent-dim font-medium text-accent"
                  : "border-transparent text-muted hover:border-line hover:bg-elevated hover:text-fg"
              }`}
            >
              {n.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

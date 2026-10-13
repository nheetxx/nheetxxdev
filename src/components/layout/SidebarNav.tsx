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
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-dim font-medium text-accent"
                  : "text-muted hover:bg-bg hover:text-fg"
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

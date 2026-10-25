import Link from "next/link";
import { nav } from "@/lib/data/nav";
import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-sidebar px-4 py-6 shadow-sm lg:flex">
      <Link href="/" className="mb-8 px-3">
        <span className="font-mono text-sm tracking-tight">
          nheetxx<span className="text-fg">_</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="flex-1">
        <SidebarNav items={nav} />
      </nav>
      <p className="px-3 pt-6 text-xs text-muted">© {new Date().getFullYear()} NheetXX</p>
    </aside>
  );
}

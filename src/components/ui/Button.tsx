import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "solid" | "ghost";
};

export function Button({ variant = "solid", className = "", href, children, ...props }: Props) {
  const base =
    "inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium transition-shadow";
  const styles =
    variant === "solid"
      ? "border border-[#ff77134c] bg-[#f7b8a4] text-[#71312c] hover:shadow-glow"
      : "border border-line bg-surface text-fg hover:border-accent hover:shadow-glow";
  const cls = `${base} ${styles} ${className}`;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
      {children}
    </a>
  );
}

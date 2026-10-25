import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "solid" | "ghost";
};

export function Button({ variant = "solid", className = "", href, children, ...props }: Props) {
  const base =
    "terminal-control inline-flex items-center px-5 py-2.5 text-sm font-medium transition-shadow";
  const styles =
    variant === "solid"
      ? "border border-accent bg-accent text-bg"
      : "border border-line bg-surface text-fg hover:border-accent hover:bg-elevated";
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

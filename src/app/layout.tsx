import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { nav } from "@/lib/data/nav";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

const supabaseConnectSrc = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  try {
    return ` ${new URL(url).origin}`;
  } catch {
    return "";
  }
})();

const csp = [
  "default-src 'self'",
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.googleusercontent.com https://avatars.githubusercontent.com",
  "font-src 'self'",
  `connect-src 'self' https://github-contributions-api.jogruber.de${supabaseConnectSrc}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action https://formsubmit.co",
].join("; ");

export const metadata: Metadata = {
  title: { default: "nheetxx", template: "%s | nheetxx" },
  description: "Information Systems student at Universitas Trunojoyo Madura with an interest in cybersecurity.",
  openGraph: { type: "website", locale: "en_US" },
};
export const viewport: Viewport = { themeColor: "#0b0d12", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg">
          Skip to content
        </a>

        <MobileNav items={nav} />
        <Sidebar />

        <div className="pt-14 lg:pl-64 lg:pt-0">
          <main id="main" className="min-h-dvh">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
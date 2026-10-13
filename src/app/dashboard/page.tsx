import type { Metadata } from "next";
import { dashboardLinks } from "@/lib/data/dashboard";
import { GitHubContributions } from "@/components/dashboard/GitHubContributions";
import { isSafeHttpsUrl } from "@/lib/validate";

export const metadata: Metadata = { title: "Dashboard" };

const websiteUrl = isSafeHttpsUrl(dashboardLinks.websiteUrl)
  ? dashboardLinks.websiteUrl
  : "";
const pageSpeedUrl = websiteUrl
  ? `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(websiteUrl)}`
  : "";

export default function DashboardPage() {
  return (
    <section
      aria-labelledby="dashboard-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">
          A live look at my website and GitHub activity.
        </p>
      </header>

      <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span aria-hidden="true" className="text-accent">◷</span>
          <h2 className="text-lg font-semibold">PageSpeed Insights</h2>
        </div>
        <p className="mt-1 text-sm text-muted">Page Speed Index by Google</p>
        <p className="mt-1 break-all text-sm text-muted">
          {websiteUrl || "web url."}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-line text-xs text-muted">
          <span className="border-b border-accent pb-3 text-accent">Performance</span>
          <span className="pb-3">Accessibility</span>
          <span className="pb-3">Best Practices</span>
          <span className="pb-3">SEO</span>
        </div>
        <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-muted">
            {websiteUrl
              ? "Run a fresh report to see your website scores."
              : "Loading PageSpeed report."}
          </p>
          {pageSpeedUrl && (
            <a
              href={pageSpeedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent transition-colors hover:text-fg"
            >
              Run PageSpeed report <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </article>

      <GitHubContributions username={dashboardLinks.githubUsername} />
    </section>
  );
}

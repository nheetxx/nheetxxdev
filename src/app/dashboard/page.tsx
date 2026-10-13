import type { Metadata } from "next";
import { dashboardLinks } from "@/lib/data/dashboard";
import { GitHubContributions } from "@/components/dashboard/GitHubContributions";
import { PageSpeedReport } from "@/components/dashboard/PageSpeedReport";
import { isSafeHttpsUrl } from "@/lib/validate";

export const metadata: Metadata = { title: "Dashboard" };

const websiteUrl = isSafeHttpsUrl(dashboardLinks.websiteUrl)
  ? dashboardLinks.websiteUrl
  : "";
export default function DashboardPage() {
  return (
    <section
      aria-labelledby="dashboard-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">
          A live look at my website and GitHub activity.
        </p>
      </header>

      <PageSpeedReport
        websiteUrl={websiteUrl || dashboardLinks.websiteUrl}
        pageSpeedUrl={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(dashboardLinks.websiteUrl)}`}
      />

      <GitHubContributions username={dashboardLinks.githubUsername} />
    </section>
  );
}

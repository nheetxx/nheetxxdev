"use client";

import { useEffect, useState } from "react";

const scoreLabels = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["best-practices", "Best Practices"],
  ["seo", "SEO"],
] as const;

type ScoreCategory = (typeof scoreLabels)[number][0];
type Strategy = "mobile" | "desktop";

interface PageSpeedReportData {
  strategy: Strategy;
  scores: Record<ScoreCategory, number | null>;
  fetchTime: string | null;
}

interface PageSpeedApiResponse {
  error?: string;
  strategy?: Strategy;
  scores?: Record<ScoreCategory, number | null>;
  fetchTime?: string | null;
}

function scoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) return "text-muted";
  if (score >= 90) return "text-emerald-400";
  if (score >= 50) return "text-amber-300";
  return "text-rose-400";
}

export function PageSpeedReport({
  websiteUrl,
  pageSpeedUrl,
}: {
  websiteUrl: string;
  pageSpeedUrl: string;
}) {
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [refreshCount, setRefreshCount] = useState(0);
  const [report, setReport] = useState<PageSpeedReportData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/pagespeed?strategy=${strategy}`, {
          signal: controller.signal,
        });
        const result: PageSpeedApiResponse = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Could not load PageSpeed scores.");
        }
        if (!result.scores || !result.strategy) {
          throw new Error("The PageSpeed API returned incomplete data.");
        }
        setReport({
          strategy: result.strategy,
          scores: result.scores,
          fetchTime: result.fetchTime ?? null,
        });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Could not load PageSpeed scores.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadReport();
    return () => controller.abort();
  }, [strategy, refreshCount]);

  return (
    <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span aria-hidden="true" className="text-accent">◷</span>
            <h2 className="text-lg font-semibold">PageSpeed Insights</h2>
          </div>
          <p className="mt-1 text-sm text-muted">Google Lighthouse scores</p>
          <p className="mt-1 break-all text-sm text-muted">{websiteUrl}</p>
        </div>
        <a
          href={pageSpeedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent transition-colors hover:text-fg"
        >
          Full report <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <div className="flex gap-4" role="group" aria-label="Device strategy">
          {(["mobile", "desktop"] as const).map((device) => (
            <button
              key={device}
              type="button"
              aria-pressed={strategy === device}
              onClick={() => setStrategy(device)}
              className={`border-b pb-3 text-xs capitalize transition-colors ${
                strategy === device
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {device}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
          disabled={loading}
          className="mb-2 text-xs text-muted transition-colors hover:text-accent disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center" aria-live="polite">
          <p className="text-sm text-accent">{error}</p>
          <p className="text-xs text-muted">
            Scores refresh hourly to stay within the PageSpeed API quota.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
            {scoreLabels.map(([category, label]) => {
              const score = report?.scores[category];
              return (
                <li key={category} className="rounded-lg border border-line bg-bg px-3 py-4 text-center">
                  <span className={`block text-2xl font-semibold ${scoreColor(score)}`}>
                    {loading ? "…" : score ?? "—"}
                  </span>
                  <span className="mt-1 block text-xs text-muted">{label}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted" aria-live="polite">
            {loading
              ? "Loading latest scores…"
              : report?.fetchTime
                ? `Last tested ${new Date(report.fetchTime).toLocaleString()}`
                : "Latest available scores"}
            {" · "}
            Scores refresh hourly.
          </p>
        </>
      )}
    </article>
  );
}

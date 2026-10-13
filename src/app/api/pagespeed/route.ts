import { NextResponse } from "next/server";
import { dashboardLinks } from "@/lib/data/dashboard";
import { isSafeHttpsUrl } from "@/lib/validate";

const scoreCategories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;

type ScoreCategory = (typeof scoreCategories)[number];
type Strategy = "mobile" | "desktop";

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: Partial<Record<ScoreCategory, { score?: number | null }>>;
    fetchTime?: string;
  };
}

export async function GET(request: Request) {
  const strategyParam = new URL(request.url).searchParams.get("strategy") ?? "mobile";
  if (strategyParam !== "mobile" && strategyParam !== "desktop") {
    return NextResponse.json({ error: "Strategy must be mobile or desktop." }, { status: 400 });
  }

  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "PageSpeed Insights is not configured yet. Add PAGESPEED_API_KEY to .env.local or your deployment environment.",
      },
      { status: 503 },
    );
  }

  if (!isSafeHttpsUrl(dashboardLinks.websiteUrl)) {
    return NextResponse.json({ error: "The website URL is not configured." }, { status: 500 });
  }

  const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", dashboardLinks.websiteUrl);
  apiUrl.searchParams.set("strategy", strategyParam);
  apiUrl.searchParams.set("key", apiKey);
  for (const category of scoreCategories) {
    apiUrl.searchParams.append("category", category);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not connect to Google PageSpeed Insights. Try again later." },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (!response.ok) {
    const status = response.status === 429 ? 429 : 502;
    return NextResponse.json(
      { error: `Google PageSpeed Insights returned an error (${response.status}).` },
      {
        status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  let report: PageSpeedResponse;
  try {
    report = await response.json();
  } catch {
    return NextResponse.json(
      { error: "Google PageSpeed Insights returned an invalid response." },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const categories = report.lighthouseResult?.categories;
  if (!categories) {
    return NextResponse.json(
      { error: "The PageSpeed report did not include category scores." },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const getScore = (category: ScoreCategory) => {
    const score = categories[category]?.score;
    return typeof score === "number" && Number.isFinite(score)
      ? Math.round(score * 100)
      : null;
  };
  const scores: Record<ScoreCategory, number | null> = {
    performance: getScore("performance"),
    accessibility: getScore("accessibility"),
    "best-practices": getScore("best-practices"),
    seo: getScore("seo"),
  };

  return NextResponse.json(
    {
      strategy: strategyParam,
      scores,
      fetchTime: report.lighthouseResult?.fetchTime ?? null,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

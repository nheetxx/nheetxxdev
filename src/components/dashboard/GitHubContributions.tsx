"use client";

import { useEffect, useState } from "react";

type Contribution = {
  date: string;
  count: number;
  level: number;
};

type ContributionData = {
  total: number;
  contributions: Contribution[];
};

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; data: ContributionData };

function isContributionResponse(value: unknown): value is {
  total: { lastYear: number };
  contributions: Contribution[];
} {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  if (typeof response.total !== "object" || response.total === null) return false;
  const total = response.total as Record<string, unknown>;
  if (!Array.isArray(response.contributions) || typeof total.lastYear !== "number") return false;

  return response.contributions.every(
    (item: unknown) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).date === "string" &&
      typeof (item as Record<string, unknown>).count === "number" &&
      typeof (item as Record<string, unknown>).level === "number",
  );
}

const levelClasses = [
  "bg-[#353535]",
  "bg-[#9bbce0]/25",
  "bg-[#9bbce0]/45",
  "bg-[#9bbce0]/70",
  "bg-[#9bbce0]",
];

export function GitHubContributions({ username }: { username: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const safeUsername = username.trim();
    if (!safeUsername) {
      setState({ status: "error" });
      return;
    }

    let isStale = false;

    async function loadContributions() {
      try {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(safeUsername)}?y=last`,
        );
        if (!response.ok) {
          throw new Error(`GitHub contributions request failed (${response.status}).`);
        }

        const result: unknown = await response.json();
        if (!isContributionResponse(result)) {
          throw new Error("GitHub contributions response had an unexpected format.");
        }

        if (isStale) return;

        setState({
          status: "loaded",
          data: {
            total: result.total.lastYear,
            contributions: result.contributions,
          },
        });
      } catch (error) {
        if (isStale) return;
        console.error("Unable to load GitHub contribution data.", error);
        setState({ status: "error" });
      }
    }

    void loadContributions();
    return () => {
      isStale = true;
    };
  }, [username]);

  const profileUrl = `https://github.com/${encodeURIComponent(username)}`;

  return (
    <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">GitHub Contributions</h2>
          <p className="mt-1 text-sm text-muted">My contributions from the last year on GitHub.</p>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent transition-colors hover:text-fg"
        >
          @{username} <span aria-hidden="true">↗</span>
        </a>
      </div>

      {state.status === "loading" && (
        <p role="status" className="mt-6 text-sm text-muted">
          Loading contribution activity…
        </p>
      )}

      {state.status === "error" && (
        <p role="alert" className="mt-6 text-sm text-muted">
          Contribution activity could not be loaded right now. You can still view the data on{" "}
          <a className="text-accent hover:text-fg" href={profileUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      )}

      {state.status === "loaded" && (
        <>
          {(() => {
            const contributions = state.data.contributions;
            const paddedContributions: Array<Contribution | null> = [...contributions];
            while (paddedContributions.length % 7 !== 0) {
              paddedContributions.push(null);
            }
            const weeks = Array.from({ length: paddedContributions.length / 7 }, (_, index) =>
              paddedContributions.slice(index * 7, index * 7 + 7),
            );
            const today = new Date();
            const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            const monday = new Date(todayUtc);
            monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
            const thisWeek = contributions
              .filter((contribution) => new Date(`${contribution.date}T00:00:00Z`) >= monday)
              .reduce((sum, contribution) => sum + contribution.count, 0);
            const bestDay = contributions.reduce(
              (best, contribution) => Math.max(best, contribution.count),
              0,
            );

            return (
              <>
                <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Total", state.data.total.toLocaleString()],
                    ["This Week", thisWeek.toLocaleString()],
                    ["Best Day", bestDay.toLocaleString()],
                    ["Average", (state.data.total / 365).toFixed(1)],
                  ].map(([label, value]) => (
                    <li key={label} className="rounded-lg border border-line bg-bg px-3 py-2.5">
                      <span className="block text-xs text-muted">{label}</span>
                      <span className="mt-1 block text-lg font-semibold">{value}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 overflow-x-auto pb-2">
                  <div className="mx-auto w-max">
                    <div
                      aria-hidden="true"
                      className="mb-2 grid h-4 auto-cols-[11px] grid-flow-col gap-1 text-[10px] text-muted"
                      style={{ gridTemplateColumns: `repeat(${weeks.length}, 11px)` }}
                    >
                      {weeks.map((week, index) => {
                        const firstContribution = week.find(
                          (contribution): contribution is Contribution => contribution !== null,
                        );
                        if (!firstContribution) return <span key={`empty-${index}`} />;
                        const date = new Date(`${firstContribution.date}T00:00:00Z`);
                        const previousDate =
                          index > 0
                            ? new Date(
                                `${weeks[index - 1].find(
                                  (contribution): contribution is Contribution => contribution !== null,
                                )?.date}T00:00:00Z`,
                              )
                            : null;
                        if (previousDate && date.getUTCMonth() === previousDate.getUTCMonth()) {
                          return <span key={firstContribution.date} />;
                        }
                        return (
                          <span key={firstContribution.date} className="whitespace-nowrap">
                            {date.toLocaleString("en", { month: "short", timeZone: "UTC" })}
                          </span>
                        );
                      })}
                    </div>
                    <div
                      role="img"
                      aria-label={`Contribution calendar for ${username}: ${state.data.total.toLocaleString()} contributions in the last year`}
                      className="grid auto-cols-[11px] grid-flow-col grid-rows-7 gap-1"
                    >
                      {weeks.flatMap((week) =>
                        week.map((contribution) => (
                          contribution ? (
                            <span
                              key={contribution.date}
                              title={`${contribution.count} contributions on ${contribution.date}`}
                              className={`size-[11px] rounded-[2px] ${levelClasses[
                                Math.max(0, Math.min(4, contribution.level))
                              ]}`}
                            />
                          ) : (
                            <span key={`empty-${week[0]?.date ?? "calendar"}`} aria-hidden="true" />
                          )
                        )),
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted">
                  <span>Less</span>
                  {levelClasses.map((levelClass, index) => (
                    <span key={index} aria-hidden="true" className={`size-2.5 rounded-sm ${levelClass}`} />
                  ))}
                  <span>More</span>
                </div>
              </>
            );
          })()}
        </>
      )}
    </article>
  );
}

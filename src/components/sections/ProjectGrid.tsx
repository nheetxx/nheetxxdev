import type { Project } from "@/types";
import { isSafeHttpsUrl } from "@/lib/validate";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const skills = [...new Set(projects.flatMap((p) => p.stack))].sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <section
      aria-labelledby="projects-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:gap-16 lg:px-12 lg:py-20"
    >
      <div>
        <h1 id="projects-title" className="text-3xl font-semibold tracking-tight">
          Portfolio
        </h1>
        <p className="mt-2 max-w-md text-muted">
          A selection of projects and experiments.
        </p>
      </div>

      {skills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Tools & technologies</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s} className="rounded-full border border-line px-3 py-1 text-sm text-muted">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <article className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/40">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <p className="mt-1 text-sm text-accent">
                {p.role}, {p.period}
              </p>
              <p className="mt-3 text-sm text-muted">{p.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="rounded bg-accent-dim px-2 py-0.5 text-xs text-accent">
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-4 text-sm">
                {p.href && isSafeHttpsUrl(p.href) && (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                   View project
                  </a>
                )}
                {p.repo && isSafeHttpsUrl(p.repo) && (
                  <a href={p.repo} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    Source code
                  </a>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

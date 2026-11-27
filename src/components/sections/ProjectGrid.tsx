import type { Project } from "@/types";
import { isSafeHttpsUrl } from "@/lib/validate";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <section
      aria-labelledby="projects-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-6 pb-12 sm:px-10 sm:pt-8 sm:pb-16 lg:mx-0 lg:gap-12 lg:px-12 lg:pt-10 lg:pb-20"
    >
      <div>
        <h2 id="projects-title" className="text-2xl font-semibold tracking-tight">
          Projects
        </h2>
        <p className="mt-2 max-w-md text-muted">
          A selection of projects and experiments.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <article className="terminal-window border border-line bg-surface p-6 transition-colors hover:border-accent/40">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">
                {p.role}, {p.period}
              </p>
              <p className="mt-3 text-sm text-muted">{p.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="terminal-chip border border-line bg-elevated px-2 py-0.5 text-xs text-muted">
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

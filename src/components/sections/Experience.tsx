import { experiences } from "@/lib/data/experience";

export function Experience() {
  return (
    <section
      aria-labelledby="exp-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="exp-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Experience
        </h1>
        <p className="mt-2 text-sm text-muted">A timeline of my work, education, and projects.</p>
      </header>

      <ol className="relative flex flex-col gap-5 border-l border-line pl-6">
        {experiences.map((experience) => (
          <li key={`${experience.role}-${experience.organization}`} className="relative">
            <span aria-hidden="true" className="absolute -left-[29px] top-6 size-2.5 rounded-full border-2 border-accent bg-bg" />
            <article className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-accent">{experience.period}</p>
              <h2 className="mt-2 text-lg font-semibold">{experience.role}</h2>
              <p className="mt-1 text-sm text-muted">{experience.organization}</p>
              <p className="mt-4 text-sm leading-6 text-muted">{experience.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

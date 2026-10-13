import { aboutSections } from "@/lib/data/about";

export function About() {
  return (
    <section
      aria-labelledby="about-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="about-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          About
        </h1>
        <p className="mt-2 text-sm text-muted">A little more about me and what I do.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {aboutSections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-muted">
                {paragraph}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

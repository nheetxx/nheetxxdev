import { aboutSections } from "@/lib/data/about";

export function About() {
  const [introduction, ...sections] = aboutSections;

  return (
    <section
      aria-labelledby="about-title"
      className="mx-auto flex w-full max-w-4xl flex-col px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="about-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          About
        </h1>
        <p className="mt-2 text-sm text-muted">Get to know me beyond the resume.</p>
      </header>

      {introduction && (
        <p className="max-w-3xl py-7 text-base leading-8 text-fg sm:py-8">
          {introduction.paragraphs.join(" ")}
        </p>
      )}

      {sections.map((section) => (
        <article key={section.title} className="max-w-3xl border-t border-line py-7 sm:py-8">
          <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-base leading-8 text-muted">
              {paragraph}
            </p>
          ))}
        </article>
      ))}
    </section>
  );
}

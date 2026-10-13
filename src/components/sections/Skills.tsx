import { certificates, skillGroups } from "@/lib/data/skillset";

export function Skills() {
  return (
    <section
      aria-labelledby="skills-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="skills-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Skillset
        </h1>
        <p className="mt-2 text-sm text-muted">Tools and areas I’m learning and working with.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {skillGroups.map((group) => (
          <article key={group.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill} className="rounded-full border border-line px-3 py-1.5 text-sm text-muted">
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section aria-labelledby="certificates-title" className="flex flex-col gap-4">
        <div>
          <h2 id="certificates-title" className="text-2xl font-semibold tracking-tight">
            Certificates
          </h2>
          <p className="mt-2 text-sm text-muted">Certificates and learning milestones.</p>
        </div>
        {certificates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((certificate) => (
              <article key={`${certificate.title}-${certificate.issuer}`} className="overflow-hidden rounded-2xl border border-line bg-surface">
                {certificate.image ? (
                  <img src={certificate.image} alt={`${certificate.title} certificate`} className="aspect-video w-full bg-bg object-contain" />
                ) : (
                  <div className="grid aspect-video place-items-center border-b border-line bg-bg text-sm text-muted">
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold">{certificate.title || ":)"}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {certificate.issuer || "Issuer not added"} · {certificate.date || "Date not added"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-6">
            <p className="font-medium">Still empty</p>
          </div>
        )}
      </section>
    </section>
  );
}

import { ContactForm } from "@/components/sections/ContactForm";
import { profile } from "@/lib/data/profile";
import { isSafeHttpsUrl } from "@/lib/validate";

export function Contact() {
  return (
    <section
      aria-labelledby="contact-title"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:px-12 lg:py-20"
    >
      <header className="border-b border-line pb-6">
        <h1 id="contact-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Contact
        </h1>
        <p className="mt-2 text-sm text-muted">Have a question or want to work together? Send me a message.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <ContactForm />

        <aside className="flex flex-col gap-4">
          <article className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">Get in touch</h2>
            {profile.contactEmail ? (
              <a href={`mailto:${profile.contactEmail}`} className="mt-3 inline-block text-sm text-accent hover:text-fg">
                {profile.contactEmail}
              </a>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                Add your email in <code className="rounded bg-bg px-1.5 py-0.5 text-accent">profile.ts</code> to
                enable direct messages.
              </p>
            )}
          </article>
          <article className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">Find me online</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {profile.socials.filter((social) => isSafeHttpsUrl(social.href)).map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {social.label} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { profile } from "@/lib/data/profile";
import { isSafeHttpsUrl } from "@/lib/validate";

export function Hero() {
  const socials = profile.socials.filter((s) => isSafeHttpsUrl(s.href));
  const showResume = profile.resumeUrl !== "" && isSafeHttpsUrl(profile.resumeUrl);

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-14 sm:px-10 sm:pb-20 lg:mx-0 lg:px-8 lg:pb-24"
    >
      <div
        aria-hidden="true"
        className="hero-pattern -mx-6 h-[24vh] min-h-36 border-y border-line sm:-mx-10 lg:-mx-8"
      />

      <div className="-mt-14 ml-2">
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={`${profile.name} portrait`}
            className="size-28 rounded-2xl border-[6px] border-bg bg-surface object-cover shadow-sm"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid size-28 place-items-center rounded-2xl border-[6px] border-bg bg-surface text-3xl font-semibold text-fg shadow-sm"
          >
            {profile.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4">
        <header>
          <h1 id="hero-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {"Fajarin Naufal Al Ghazir"}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted">{profile.role}</p>
        </header>
        <div className="max-w-3xl">
          <p className="text-sm leading-relaxed text-fg">{profile.tagline}</p>
          <p className="mt-2 text-sm text-muted">{profile.location}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap gap-2">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} profile`}
              title={s.label}
              className="terminal-control grid size-10 place-items-center border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <SocialIcon label={s.label} />
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-line pt-5">
        <div className="terminal-window flex flex-col gap-5 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-lg font-semibold">Let’s work together</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Have a cybersecurity or web project in mind? I’d be glad to hear about it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact/">Get in touch</Button>
            {showResume && (
              <Button href={profile.resumeUrl} variant="ghost">
                Download resume
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

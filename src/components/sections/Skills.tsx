"use client";

import { useEffect, useRef, useState } from "react";
import { certificates, skillGroups } from "@/lib/data/skillset";

const skillMarqueeCopies = 16;

export function Skills() {
  const certificateTrack = useRef<HTMLDivElement>(null);
  const wrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCertificateScrolling, setIsCertificateScrolling] = useState(false);

  useEffect(() => {
    const track = certificateTrack.current;
    const firstSequence = track?.querySelector("ul");
    if (!track || !firstSequence) return;

    const centerTrack = () => {
      track.scrollLeft = firstSequence.getBoundingClientRect().width;
    };

    centerTrack();
    const observer = new ResizeObserver(centerTrack);
    observer.observe(firstSequence);

    return () => {
      observer.disconnect();
      if (wrapTimer.current) clearTimeout(wrapTimer.current);
    };
  }, []);

  const scrollCertificates = (direction: -1 | 1) => {
    const track = certificateTrack.current;
    if (!track) return;

    const firstSequence = track.querySelector("ul");
    const firstCard = firstSequence?.querySelector("li");
    if (!firstSequence || !firstCard) return;

    const sequenceWidth = firstSequence.getBoundingClientRect().width;
    const gap = Number.parseFloat(getComputedStyle(firstSequence).columnGap);
    const cardStep = firstCard.getBoundingClientRect().width + gap;
    track.scrollBy({ left: direction * cardStep, behavior: "smooth" });
    setIsCertificateScrolling(true);

    if (wrapTimer.current) clearTimeout(wrapTimer.current);
    wrapTimer.current = setTimeout(() => {
      if (track.scrollLeft >= sequenceWidth * 2) {
        track.scrollLeft -= sequenceWidth;
      } else if (track.scrollLeft < sequenceWidth) {
        track.scrollLeft += sequenceWidth;
      }
      setIsCertificateScrolling(false);
    }, 500);
  };

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

      <section aria-label="Skills by category" className="flex flex-col divide-y divide-line border-y border-line">
        {skillGroups.map((group, groupIndex) => (
          <div key={group.title} className="grid gap-3 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{group.title}</h2>
            <div className="skill-marquee">
              <ul className="sr-only">
                {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
              <div
                aria-hidden="true"
                className="skill-marquee-track"
                style={{ animationDuration: `${34 + groupIndex * 6}s`, animationDirection: groupIndex % 2 ? "reverse" : "normal" }}
              >
                {Array.from({ length: skillMarqueeCopies }, (_, copyIndex) => (
                  <ul key={copyIndex} className="skill-marquee-sequence">
                    {group.skills.map((skill) => (
                      <li key={skill} className="terminal-chip border border-line bg-surface px-3.5 py-2 text-sm text-fg">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="certificates-title" className="flex flex-col items-center gap-5 border-t border-line pt-8">
        <div className="w-full">
          <h2 id="certificates-title" className="text-2xl font-semibold tracking-tight">
            Certificates
          </h2>
          <p className="mt-2 text-sm text-muted">Certificates and learning milestones.</p>
        </div>

        {certificates.length > 0 ? (
          <div
            ref={certificateTrack}
            className={`certificate-carousel w-full min-w-0${isCertificateScrolling ? " is-scrolling" : ""}`}
            role="region"
            aria-label="Certificates carousel"
          >
            {[0, 1, 2].map((copyIndex) => (
              <ul key={copyIndex} className="certificate-sequence" aria-hidden={copyIndex !== 1}>
                {Array.from({ length: 3 }, (_, repeatIndex) =>
                  certificates.map((certificate, certificateIndex) => (
                    <li
                      key={`${certificate.title}-${certificate.issuer}-${copyIndex}-${repeatIndex}-${certificateIndex}`}
                      className="terminal-window w-[min(82vw,32rem)] shrink-0 border border-line bg-surface"
                      aria-hidden={repeatIndex > 0}
                    >
                      {certificate.image ? (
                        <img src={certificate.image} alt={`${certificate.title} certificate`} draggable={false} className="aspect-video w-full bg-bg object-contain" />
                      ) : (
                        <div className="grid aspect-video place-items-center border-b border-line bg-bg text-sm text-muted">
                          Certificate image coming soon
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-semibold">{certificate.title || ":)"}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {certificate.issuer || "Issuer not added"} · {certificate.date || "Date not added"}
                        </p>
                      </div>
                    </li>
                  )),
                )}
              </ul>
            ))}
          </div>
        ) : (
          <div className="terminal-window w-full border border-dashed border-line bg-surface p-6">
            <p className="font-medium">Still empty</p>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              aria-label="Scroll certificates left"
              onClick={() => scrollCertificates(-1)}
              className="terminal-control grid size-10 place-items-center border border-line bg-surface text-fg transition hover:border-accent hover:text-accent"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label="Scroll certificates right"
              onClick={() => scrollCertificates(1)}
              className="terminal-control grid size-10 place-items-center border border-line bg-surface text-fg transition hover:border-accent hover:text-accent"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

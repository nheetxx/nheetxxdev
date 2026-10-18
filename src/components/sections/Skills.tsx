"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { certificates, skillGroups } from "@/lib/data/skillset";

const skillMarqueeCopies = 16;

export function Skills() {
  const certificateTrack = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ pointerId: number; x: number; scrollLeft: number } | null>(null);
  const [certificateScroll, setCertificateScroll] = useState({ canScroll: false, canScrollBack: false, canScrollForward: false });

  const updateCertificateScroll = useCallback(() => {
    const track = certificateTrack.current;
    if (!track) return;

    setCertificateScroll({
      canScroll: track.scrollWidth > track.clientWidth + 1,
      canScrollBack: track.scrollLeft > 1,
      canScrollForward: track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const track = certificateTrack.current;
    if (!track) return;

    updateCertificateScroll();
    const observer = new ResizeObserver(updateCertificateScroll);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateCertificateScroll]);

  const scrollCertificates = (direction: -1 | 1) => {
    const track = certificateTrack.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.8, 260), behavior: "smooth" });
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
                      <li key={skill} className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-fg">
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

      <section aria-labelledby="certificates-title" className="flex flex-col gap-5 border-t border-line pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="certificates-title" className="text-2xl font-semibold tracking-tight">
              Certificates
            </h2>
            <p className="mt-2 text-sm text-muted">Certificates and learning milestones.</p>
          </div>
          {certificateScroll.canScroll && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                aria-label="Scroll certificates left"
                disabled={!certificateScroll.canScrollBack}
                onClick={() => scrollCertificates(-1)}
                className="grid size-10 place-items-center rounded-full border border-line bg-surface text-fg transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                aria-label="Scroll certificates right"
                disabled={!certificateScroll.canScrollForward}
                onClick={() => scrollCertificates(1)}
                className="grid size-10 place-items-center rounded-full border border-line bg-surface text-fg transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>

        {certificates.length > 0 ? (
          <div
            ref={certificateTrack}
            role="region"
            aria-label="Certificates carousel"
            tabIndex={0}
            onScroll={updateCertificateScroll}
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse" || event.button !== 0) return;
              dragStart.current = { pointerId: event.pointerId, x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const start = dragStart.current;
              if (!start || start.pointerId !== event.pointerId) return;
              event.currentTarget.scrollLeft = start.scrollLeft - (event.clientX - start.x);
            }}
            onPointerUp={(event) => {
              if (dragStart.current?.pointerId === event.pointerId) dragStart.current = null;
            }}
            onPointerCancel={() => { dragStart.current = null; }}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 select-none cursor-grab active:cursor-grabbing [scrollbar-width:thin] [scrollbar-color:var(--color-line)_transparent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {certificates.map((certificate) => (
              <article
                key={`${certificate.title}-${certificate.issuer}`}
                className="w-[min(82vw,32rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface"
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

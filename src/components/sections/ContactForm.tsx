"use client";

import { useState, type FormEvent } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkjovdwa";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus("");

    try {
      const formData = new FormData(form);
      formData.set("_subject", String(formData.get("subject") ?? "New contact message"));
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const formErrors =
          typeof result === "object" && result !== null && "errors" in result &&
          Array.isArray(result.errors)
            ? result.errors
                .map((item: unknown) =>
                  typeof item === "object" &&
                  item !== null &&
                  "message" in item &&
                  typeof item.message === "string"
                    ? item.message
                    : null,
                )
                .filter((item): item is string => item !== null)
            : [];
        const message =
          formErrors.join(" ") ||
          `Formspree rejected the submission (HTTP ${response.status}). Check that the form is activated and the recipient email is verified in Formspree.`;
        throw new Error(message);
      }

      form.reset();
      setStatus("Your message has been sent. Thank you for reaching out!");
    } catch (error) {
      console.error("Unable to send contact form message.", error);
      setStatus(
        error instanceof TypeError
          ? "Could not connect to Formspree. Check your internet connection and try again."
          : error instanceof Error
            ? error.message
            : "Your message could not be sent. Please try again later or email me directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Send a message</h2>
      <p className="mt-2 text-sm text-muted">Your message will be sent directly to my inbox.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            className="rounded-lg border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="rounded-lg border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm">
        Subject
        <input
          name="subject"
          required
          maxLength={120}
          className="rounded-lg border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
        />
      </label>

      <label className="mt-4 flex flex-col gap-2 text-sm">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          className="resize-y rounded-lg border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex rounded-md border border-[#ff77134c] bg-[#f7b8a4] px-5 py-2.5 text-sm font-medium text-[#71312c] transition-shadow hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
      {status && <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">{status}</p>}
    </form>
  );
}

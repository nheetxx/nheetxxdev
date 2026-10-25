"use client";

import { useState, type FormEvent } from "react";

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      const result: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Message could not be sent (HTTP ${response.status}).`);
      }

      form.reset();
      setStatus("Your message has been sent. Thank you for reaching out!");
    } catch (error) {
      console.error("Unable to send contact form message.", error);
      setStatus(
        error instanceof TypeError
          ? "Could not connect to the contact service. Check your internet connection and try again."
          : error instanceof Error
            ? error.message
            : "Your message could not be sent. Please try again later or email me directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="terminal-window border border-line bg-surface p-6 sm:p-8">
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
            className="terminal-control border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
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
            className="terminal-control border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm">
        Subject
        <input
          name="subject"
          required
          maxLength={120}
          className="terminal-control border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
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
          className="terminal-control resize-y border border-line bg-bg px-3 py-2.5 text-fg outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="terminal-control mt-5 inline-flex border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-shadow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
      {status && <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">{status}</p>}
    </form>
  );
}

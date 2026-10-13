"use client";

import { useState, type FormEvent } from "react";

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setStatus("Add your email address in src/lib/data/profile.ts before using this form.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(String(formData.get("subject")));
    const body = encodeURIComponent(
      `From: ${String(formData.get("name"))} (${String(formData.get("senderEmail"))})\n\n${String(formData.get("message"))}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setStatus("Your email app should open with the message ready to send.");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Send a message</h2>
      <p className="mt-2 text-sm text-muted">This form opens your email app; it does not store your message.</p>

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
            name="senderEmail"
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
        className="mt-5 inline-flex rounded-md border border-[#ff77134c] bg-[#f7b8a4] px-5 py-2.5 text-sm font-medium text-[#71312c] transition-shadow hover:shadow-glow"
      >
        Send message
      </button>
      {status && <p role="status" className="mt-3 text-sm text-muted">{status}</p>}
    </form>
  );
}

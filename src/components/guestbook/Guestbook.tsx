"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Entry = {
  id: number;
  author_name: string;
  author_avatar_url: string | null;
  message: string;
  created_at: string;
};

function getDisplayName(user: User): string {
  const name = user.user_metadata.full_name ?? user.user_metadata.name;
  if (typeof name === "string" && name.trim()) return name.trim().slice(0, 60);
  return user.email?.split("@")[0]?.slice(0, 60) || "Guest";
}

function getAvatarUrl(user: User): string | null {
  const avatar = user.user_metadata.avatar_url ?? user.user_metadata.picture;
  if (typeof avatar !== "string") return null;

  try {
    const url = new URL(avatar);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function Guestbook() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();

  const loadEntries = useCallback(async () => {
    if (!supabase) {
      setLoadingEntries(false);
      return;
    }
    setLoadingEntries(true);
    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id, author_name, author_avatar_url, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Unable to load guestbook entries.", error);
      setStatus("Guestbook messages could not be loaded. Check the Supabase table and row-level security setup.");
    } else {
      setEntries(data ?? []);
    }
    setLoadingEntries(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setLoadingEntries(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Unable to read the current guestbook session.", error);
        setStatus("Your sign-in status could not be checked. Please refresh and try again.");
      }
      setUser(data.session?.user ?? null);
    });
    void loadEntries();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadEntries, supabase]);

  async function signIn(provider: "google" | "github") {
    if (!supabase) return;
    setStatus("");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const redirectTo = `${window.location.origin}${basePath}/guestbook/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      console.error(`Unable to sign in with ${provider}.`, error);
      setStatus(`Could not start ${provider === "google" ? "Google" : "GitHub"} sign-in. Check your Supabase OAuth settings.`);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out from the guestbook.", error);
      setStatus("Could not sign out. Please try again.");
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;

    const cleanMessage = message.trim();
    if (cleanMessage.length < 2 || cleanMessage.length > 500) {
      setStatus("Messages must be between 2 and 500 characters.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    const { error } = await supabase.from("guestbook_entries").insert({
      user_id: user.id,
      author_name: getDisplayName(user),
      author_avatar_url: getAvatarUrl(user),
      message: cleanMessage,
    });

    if (error) {
      console.error("Unable to save guestbook message.", error);
      setStatus("Your message could not be saved. Please try again.");
    } else {
      setMessage("");
      setStatus("Your message has been added.");
      await loadEntries();
    }
    setSubmitting(false);
  }

  return (
    <section aria-labelledby="guestbook-title" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:mx-0 lg:px-12 lg:py-20">
      <header className="border-b border-line pb-6">
        <h1 id="guestbook-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Guestbook
        </h1>
        <p className="mt-2 text-sm text-muted">
          Leave a message, suggestion, question, or anything you’d like to share.
        </p>
      </header>

      {!supabase ? (
        <div className="rounded-2xl border border-line bg-surface p-6">
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Messages</h2>
                <p className="mt-1 text-sm text-muted">Recent notes from visitors.</p>
              </div>
              <button
                type="button"
                onClick={() => void loadEntries()}
                className="text-sm text-accent hover:text-fg"
              >
                Refresh
              </button>
            </div>

            {loadingEntries ? (
              <p role="status" className="mt-6 text-sm text-muted">Loading messages…</p>
            ) : entries.length ? (
              <ol className="mt-5 flex flex-col divide-y divide-line">
                {entries.map((entry) => (
                  <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {entry.author_avatar_url ? (
                        <img
                          src={entry.author_avatar_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="size-10 shrink-0 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-sm font-semibold text-muted"
                        >
                          {entry.author_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <p className="truncate text-sm font-medium">{entry.author_name}</p>
                          <time dateTime={entry.created_at} className="shrink-0 text-xs text-muted">
                            {formatDate(entry.created_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">{entry.message}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 rounded-lg border border-dashed border-line p-4 text-sm text-muted">
                No messages yet. Be the first to sign in and leave a note.
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            {user ? (
              <div className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted">
                    Signed in as <span className="font-medium text-fg">{getDisplayName(user)}</span>
                  </p>
                  <button type="button" onClick={() => void signOut()} className="text-sm text-muted hover:text-fg">
                    Sign out
                  </button>
                </div>
                <form onSubmit={submitMessage} className="mt-5">
                  <label htmlFor="guestbook-message" className="text-sm font-medium">Your message</label>
                  <textarea
                    id="guestbook-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    minLength={2}
                    maxLength={500}
                    rows={5}
                    required
                    placeholder="Write a message…"
                    className="mt-2 w-full resize-y rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
                  />
                  <p className="mt-1 text-right text-xs text-muted">{message.length}/500</p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Posting…" : "Post message"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-start gap-2.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="mt-0.5 size-4 shrink-0 text-muted"
                  >
                    <path
                      d="M11.5 3.5h4v4m-.5-3.5-6 6M15 10.5v4A1.5 1.5 0 0 1 13.5 16h-9A1.5 1.5 0 0 1 3 14.5v-9A1.5 1.5 0 0 1 4.5 4h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm leading-6 text-muted">
                    Please sign in to send a message. Your password stays with Google or GitHub and is never shared with this site.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void signIn("google")}
                    className="inline-flex items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-medium text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4">
                      <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                      <path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                      <path fill="#4CAF50" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
                      <path fill="#1976D2" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
                    </svg>
                    Login with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => void signIn("github")}
                    className="inline-flex items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-medium text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
                      <path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.8 2.4 4.2 1.7.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11.2 11.2 0 0 1 5.8 0C18 5.3 19 5.6 19 5.6c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2v2.4c0 .3.2.6.8.5A11.1 11.1 0 0 0 12 .9Z" />
                    </svg>
                    Login with GitHub
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">
                  Your name and message will be visible to visitors.
                </p>
              </div>
            )}
            <p className="px-1 text-xs leading-5 text-muted">
              Please keep messages respectful. Public messages can be removed by the site owner in Supabase.
            </p>
          </aside>
        </div>
      )}

      {status && <p role="status" className="text-sm text-muted">{status}</p>}
    </section>
  );
}

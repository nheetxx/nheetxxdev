"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Entry = {
  id: number;
  author_name: string;
  message: string;
  created_at: string;
};

function getDisplayName(user: User): string {
  const name = user.user_metadata.full_name ?? user.user_metadata.name;
  if (typeof name === "string" && name.trim()) return name.trim().slice(0, 60);
  return user.email?.split("@")[0]?.slice(0, 60) || "Guest";
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
      .select("id, author_name, message, created_at")
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
    <section aria-labelledby="guestbook-title" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
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
          <h2 className="font-semibold">Guestbook setup required</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Add your Supabase project URL and public anon key to <code className="text-accent">.env.local</code>,
            then run the SQL setup in <code className="text-accent">supabase/schema.sql</code>.
            Enable Google and GitHub providers and allow this site’s <code className="text-accent">/guestbook/</code> URL
            in Supabase Auth redirect settings.
          </p>
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
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">{entry.author_name}</p>
                      <time dateTime={entry.created_at} className="shrink-0 text-xs text-muted">
                        {formatDate(entry.created_at)}
                      </time>
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
                <h2 className="text-lg font-semibold">Leave a message</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Sign in with Google or GitHub to post. Your name and message will be visible to visitors.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => void signIn("google")}
                    className="rounded-lg border border-line px-4 py-2.5 text-sm transition-colors hover:border-accent"
                  >
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => void signIn("github")}
                    className="rounded-lg border border-line px-4 py-2.5 text-sm transition-colors hover:border-accent"
                  >
                    Continue with GitHub
                  </button>
                </div>
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

"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="terminal-window flex h-[360px] w-[300px] items-center justify-center border border-line bg-surface text-sm text-muted">
      Loading emoji…
    </div>
  ),
});

type ReactionSummary = {
  entry_id: number;
  emoji: string;
  count: number;
};

type GuestbookMessage = {
  id: number;
  parent_id: number | null;
  author_name: string;
  author_avatar_url: string | null;
  is_owner: boolean;
  message: string;
  created_at: string;
};

type Entry = GuestbookMessage & {
  replies: GuestbookMessage[];
};

function MessageAuthor({ entry }: { entry: GuestbookMessage }) {
  return (
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
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium">{entry.author_name}</p>
            {entry.is_owner && (
              <span className="shrink-0 rounded-full border border-accent/40 bg-accent-dim px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                Owner
              </span>
            )}
          </div>
          <time dateTime={entry.created_at} className="shrink-0 text-xs text-muted">
            {formatDate(entry.created_at)}
          </time>
        </div>
      </div>
    </div>
  );
}

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

function isGuestbookRateLimitError(error: { code?: string; message?: string }): boolean {
  return error.code === "P0001" && error.message === "GUESTBOOK_RATE_LIMIT";
}

export function Guestbook() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [reactionSummaries, setReactionSummaries] = useState<ReactionSummary[]>([]);
  const [myReactions, setMyReactions] = useState<Set<string>>(() => new Set());
  const [reactionPickerFor, setReactionPickerFor] = useState<number | null>(null);
  const [busyReaction, setBusyReaction] = useState<number | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();

  const loadReactionCounts = useCallback(async (entryIds: number[]) => {
    if (!supabase || entryIds.length === 0) {
      setReactionSummaries([]);
      return;
    }

    const { data: counts, error: countsError } = await supabase.rpc(
      "get_guestbook_entry_reaction_counts",
      { p_entry_ids: entryIds },
    );

    if (countsError) {
      console.error("Unable to load guestbook reaction counts.", countsError);
      setStatus("Reactions could not be loaded. Run the latest Supabase schema setup and try again.");
      return;
    }
    setReactionSummaries(counts ?? []);
  }, [supabase]);

  const loadEntries = useCallback(async () => {
    if (!supabase) {
      setLoadingEntries(false);
      return;
    }
    setLoadingEntries(true);
    const { data: rootEntries, error: rootError } = await supabase
      .from("guestbook_entries")
      .select("id, parent_id, author_name, author_avatar_url, is_owner, message, created_at")
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (rootError) {
      console.error("Unable to load guestbook entries.", rootError);
      setStatus("Guestbook messages could not be loaded. Check the Supabase table and row-level security setup.");
      setLoadingEntries(false);
      return;
    }

    const roots = rootEntries ?? [];
    if (!roots.length) {
      setEntries([]);
      await loadReactionCounts([]);
      setLoadingEntries(false);
      return;
    }

    const { data: replies, error: repliesError } = await supabase
      .from("guestbook_entries")
      .select("id, parent_id, author_name, author_avatar_url, is_owner, message, created_at")
      .in("parent_id", roots.map((entry) => entry.id))
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error("Unable to load guestbook replies.", repliesError);
      setStatus("Guestbook replies could not be loaded. Check the Supabase table and row-level security setup.");
      setEntries(roots.map((entry) => ({ ...entry, replies: [] })));
      setLoadingEntries(false);
      return;
    }

    const repliesByEntry = new Map<number, GuestbookMessage[]>();
    for (const reply of replies ?? []) {
      if (reply.parent_id === null) continue;
      const entryReplies = repliesByEntry.get(reply.parent_id) ?? [];
      entryReplies.push(reply);
      repliesByEntry.set(reply.parent_id, entryReplies);
    }

    const entriesWithReplies = roots.map((entry) => ({
      ...entry,
      replies: repliesByEntry.get(entry.id) ?? [],
    }));
    setEntries(entriesWithReplies);
    await loadReactionCounts([
      ...roots.map((entry) => entry.id),
      ...(replies ?? []).map((reply) => reply.id),
    ]);
    setLoadingEntries(false);
  }, [loadReactionCounts, supabase]);

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

  useEffect(() => {
    if (!supabase || !user || entries.length === 0) {
      setMyReactions(new Set());
      return;
    }

    let active = true;
    const entryIds = entries.flatMap((entry) => [
      entry.id,
      ...entry.replies.map((reply) => reply.id),
    ]);
    void supabase
      .from("guestbook_entry_reactions")
      .select("entry_id, emoji")
      .eq("user_id", user.id)
      .in("entry_id", entryIds)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Unable to load the current user's guestbook reactions.", error);
          setStatus("Your reactions could not be loaded. Check the Supabase reaction table and permissions.");
          return;
        }
        setMyReactions(new Set((data ?? []).map(({ entry_id, emoji }) => `${entry_id}:${emoji}`)));
      });

    return () => {
      active = false;
    };
  }, [entries, supabase, user?.id]);

  async function signIn(provider: "google" | "github") {
    if (!supabase) return;
    setStatus("");
    const redirectTo = new URL(window.location.pathname, window.location.origin);
    redirectTo.search = "";
    redirectTo.hash = "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() },
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
      if (isGuestbookRateLimitError(error)) {
        setStatus("Please wait 30 seconds between guestbook messages and replies.");
      } else {
        console.error("Unable to save guestbook message.", error);
        setStatus("Your message could not be saved. Please try again.");
      }
    } else {
      setMessage("");
      setStatus("Your message has been added.");
      await loadEntries();
    }
    setSubmitting(false);
  }

  async function submitReply(event: FormEvent<HTMLFormElement>, parentId: number) {
    event.preventDefault();
    if (!supabase || !user) return;

    const cleanMessage = replyMessage.trim();
    if (cleanMessage.length < 2 || cleanMessage.length > 500) {
      setStatus("Replies must be between 2 and 500 characters.");
      return;
    }

    setSubmittingReply(true);
    setStatus("");
    const { error } = await supabase.from("guestbook_entries").insert({
      user_id: user.id,
      parent_id: parentId,
      author_name: getDisplayName(user),
      author_avatar_url: getAvatarUrl(user),
      message: cleanMessage,
    });

    if (error) {
      if (isGuestbookRateLimitError(error)) {
        setStatus("Please wait 30 seconds between guestbook messages and replies.");
      } else {
        console.error("Unable to save guestbook reply.", error);
        setStatus("Your reply could not be saved. Please try again.");
      }
    } else {
      setReplyMessage("");
      setReplyingTo(null);
      setStatus("Your reply has been added.");
      await loadEntries();
    }
    setSubmittingReply(false);
  }

  async function toggleReaction(entryId: number, emoji: string) {
    if (!supabase || !user || busyReaction !== null) return;

    setBusyReaction(entryId);
    setStatus("");
    const { error } = await supabase.rpc("toggle_guestbook_entry_reaction", {
      p_entry_id: entryId,
      p_emoji: emoji,
    });

    if (error) {
      console.error("Unable to update guestbook reaction.", error);
      setStatus("Your reaction could not be updated. Please try again.");
    } else {
      const entryIds = entries.flatMap((entry) => [
        entry.id,
        ...entry.replies.map((reply) => reply.id),
      ]);
      const { data: userReactions, error: userReactionsError } = await supabase
        .from("guestbook_entry_reactions")
        .select("entry_id, emoji")
        .eq("user_id", user.id)
        .in("entry_id", entryIds);

      if (userReactionsError) {
        console.error("Unable to refresh the current user's guestbook reactions.", userReactionsError);
        setStatus("Your reactions could not be refreshed. Please reload the page.");
      } else {
        setMyReactions(new Set((userReactions ?? []).map(({ entry_id, emoji }) => `${entry_id}:${emoji}`)));
      }
      await loadReactionCounts(entryIds);
    }
    setBusyReaction(null);
  }

  function renderReactions(entryId: number) {
    const summaries = reactionSummaries.filter((reaction) => reaction.entry_id === entryId);

    return (
      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        {summaries.map((reaction) => {
          const reactionKey = `${entryId}:${reaction.emoji}`;
          const selected = myReactions.has(reactionKey);
          return (
            <button
              key={reaction.emoji}
              type="button"
              onClick={() => void toggleReaction(entryId, reaction.emoji)}
              disabled={!user || busyReaction !== null}
              aria-pressed={selected}
              aria-label={`${reaction.emoji}, ${reaction.count} ${reaction.count === 1 ? "reaction" : "reactions"}${selected ? ", selected by you" : ""}`}
              title={user ? "Click again to remove your reaction, or choose another emoji to change it" : "Sign in to react"}
              className={`terminal-chip inline-flex items-center gap-1.5 border px-2.5 py-1 text-sm transition-colors disabled:cursor-default ${
                selected
                  ? "border-accent/50 bg-accent-dim text-accent"
                  : "border-line bg-bg text-muted hover:border-accent/40 hover:bg-elevated hover:text-fg"
              }`}
            >
              <span aria-hidden="true">{reaction.emoji}</span>
              <span className="text-xs">{reaction.count}</span>
            </button>
          );
        })}
        {user && (
          <>
            <button
              type="button"
              onClick={() => setReactionPickerFor(reactionPickerFor === entryId ? null : entryId)}
              aria-label="Choose or change your emoji reaction"
              aria-expanded={reactionPickerFor === entryId}
              disabled={busyReaction !== null}
              className="terminal-control inline-flex size-8 items-center justify-center border border-line bg-bg text-base text-muted transition-colors hover:border-accent/40 hover:bg-elevated hover:text-fg"
            >
              
            </button>
            {reactionPickerFor === entryId && (
              <div className="absolute left-0 top-full z-20 mt-2">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(emojiData) => {
                    setReactionPickerFor(null);
                    void toggleReaction(entryId, emojiData.emoji);
                  }}
                  width={300}
                  height={360}
                  lazyLoadEmojis
                />
              </div>
            )}
          </>
        )}
      </div>
    );
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
        <div className="terminal-window border border-line bg-surface p-6">
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
          <div className="terminal-window border border-line bg-surface p-6">
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
              <ol className="mt-5 flex max-h-[55dvh] flex-col divide-y divide-line overflow-y-auto overscroll-contain pr-2 md:max-h-none md:overflow-visible md:pr-0">
                {entries.map((entry) => (
                  <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
                    <MessageAuthor entry={entry} />
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">{entry.message}</p>
                    {renderReactions(entry.id)}
                    {entry.replies.length > 0 && (
                      <ol className="mt-4 ml-4 flex flex-col gap-4 border-l border-line pl-4">
                        {entry.replies.map((reply) => (
                          <li key={reply.id}>
                            <MessageAuthor entry={reply} />
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">{reply.message}</p>
                            {renderReactions(reply.id)}
                          </li>
                        ))}
                      </ol>
                    )}
                    <div className="mt-3">
                      {user ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyMessage("");
                            setReplyingTo(replyingTo === entry.id ? null : entry.id);
                          }}
                          className="text-xs font-medium text-accent hover:text-fg"
                        >
                          {replyingTo === entry.id ? "Cancel reply" : `Reply${entry.replies.length ? ` · ${entry.replies.length}` : ""}`}
                        </button>
                      ) : (
                        <span className="text-xs text-muted">Sign in to reply</span>
                      )}
                    </div>
                    {user && replyingTo === entry.id && (
                      <form onSubmit={(event) => void submitReply(event, entry.id)} className="mt-3">
                        <label htmlFor={`guestbook-reply-${entry.id}`} className="sr-only">
                          Write a reply to {entry.author_name}
                        </label>
                        <textarea
                          id={`guestbook-reply-${entry.id}`}
                          value={replyMessage}
                          onChange={(event) => setReplyMessage(event.target.value)}
                          minLength={2}
                          maxLength={500}
                          rows={3}
                          required
                          placeholder="Write a reply…"
                          className="terminal-control w-full resize-y border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
                        />
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-xs text-muted">{replyMessage.length}/500</span>
                          <button
                            type="submit"
                            disabled={submittingReply}
                            className="terminal-control border border-accent/40 bg-accent px-4 py-2 text-xs font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {submittingReply ? "Replying…" : "Post reply"}
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="terminal-chip mt-6 border border-dashed border-line p-4 text-sm text-muted">
                No messages yet. Be the first to sign in and leave a note.
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            {user ? (
              <div className="terminal-window border border-line bg-surface p-6">
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
                    className="terminal-control mt-2 w-full resize-y border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
                  />
                  <p className="mt-1 text-right text-xs text-muted">{message.length}/500</p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="terminal-control mt-3 border border-accent/40 bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Posting…" : "Post message"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="terminal-window border border-line bg-surface p-6">
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
                    className="terminal-control inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
                    className="terminal-control inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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

import { NextResponse } from "next/server";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkjovdwa";

type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function isContactSubmission(value: unknown): value is ContactSubmission {
  if (typeof value !== "object" || value === null) return false;
  const fields = value as Record<string, unknown>;
  return (
    typeof fields.name === "string" &&
    fields.name.trim().length > 0 &&
    fields.name.length <= 80 &&
    typeof fields.email === "string" &&
    fields.email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
    typeof fields.subject === "string" &&
    fields.subject.trim().length > 0 &&
    fields.subject.length <= 120 &&
    typeof fields.message === "string" &&
    fields.message.trim().length >= 10 &&
    fields.message.length <= 1000
  );
}

export async function POST(request: Request) {
  let submission: unknown;
  try {
    submission = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isContactSubmission(submission)) {
    return NextResponse.json({ error: "Please check the form fields and try again." }, { status: 400 });
  }

  const body = new URLSearchParams({
    name: submission.name.trim(),
    email: submission.email.trim(),
    subject: submission.subject.trim(),
    message: submission.message.trim(),
    _subject: submission.subject.trim(),
  });

  let response: Response;
  try {
    response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Unable to connect to Formspree from the contact API.", error);
    return NextResponse.json(
      { error: "The contact service could not be reached. Please try again later." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    let providerMessage = "";
    try {
      const result: unknown = await response.json();
      if (typeof result === "object" && result !== null && "errors" in result && Array.isArray(result.errors)) {
        providerMessage = result.errors
          .map((item: unknown) =>
            typeof item === "object" &&
            item !== null &&
            "message" in item &&
            typeof item.message === "string"
              ? item.message
              : null,
          )
          .filter((item): item is string => item !== null)
          .join(" ");
      }
    } catch {
      // Keep the response status as the actionable fallback.
    }

    console.error("Formspree rejected a contact message.", {
      status: response.status,
      message: providerMessage,
    });
    return NextResponse.json(
      { error: providerMessage || "The contact service rejected the message. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}

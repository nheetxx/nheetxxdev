import type { Metadata } from "next";
import { Guestbook } from "@/components/guestbook/Guestbook";

export const metadata: Metadata = { title: "Guestbook" };

export default function GuestbookPage() {
  return <Guestbook />;
}

import type { Metadata } from "next";
import { Skills } from "@/components/sections/Skills";

export const metadata: Metadata = { title: "Skillset" };
export default function Page() {
  return <Skills />;
}

import type { Metadata } from "next";
import { ProjectGrid } from "@/components/sections/ProjectGrid";
import { Skills } from "@/components/sections/Skills";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = { title: "Portfolio" };

export default function Page() {
  return (
    <>
      <Skills />
      <ProjectGrid projects={projects} />
    </>
  );
}

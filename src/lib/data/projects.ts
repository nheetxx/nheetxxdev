import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "project1",
    title: "nheet pwned",
    role: "Security Tool Developer",
    period: "2026",
    summary: "Password breach checker using the Have I Been Pwned API. Hashes passwords in the browser and checks results locally.",
    stack: ["JavaScript", "React", "Vite", "Web Crypto API"],
    repo: "https://github.com/nheetxx/nheet-pwned"
  },
  {
    slug: "project2",
    title: "Network Traffic Analysis",
    role: "Lab exercise",
    period: "",
    summary: "A simulated network anomaly identification exercise using log and packet analysis.",
    stack: ["Networking", "Analysis"],
  },
  {
    slug: "project3",
    title: "Systems Exploration & Troubleshooting",
    role: "Documentation",
    period: "",
    summary: "Notes on solving technical challenges and configuring Linux-based systems.",
    stack: ["System", "Linux"],
  },
  {
    slug: "project4",
    title: "Personal Portfolio",
    role: "Development",
    period: "2026",
    summary: "A responsive personal website built with a minimal visual style.",
    stack: ["JavaScript", "TypeScript"],
    repo: "https://github.com/nheetxx/nheetxxdev",
  },
  {
    slug: "project5",
    title: "Tube-Flow",
    role: "Webapp",
    period: "2026",
    summary: "YouTube Video & Music Downloader.",
    stack: ["Python", "Youtube Downloader"],
    repo: "https://github.com/nheetxx/Tube-Flow",
  },
  {
    slug: "project6",
    title: "nheetree",
    role: "Web Link",
    period: "2026",
    summary: "Clone from Linktree",
    stack: ["JavaScript"],
    repo: "https://github.com/nheetxx/nheetree"
  }
];

export const skillGroups = [
  { title: "Cybersecurity & networking", skills: ["Cybersecurity fundamentals", "Networking"] },
  { title: "Systems", skills: ["Linux", "System troubleshooting"] },
  { title: "Development", skills: ["JavaScript", "TypeScript", "Python", "C"] },
];

export type Certificate = {
  title: string;
  issuer: string;
  date: string;
  image?: string;
};

export const certificates: Certificate[] = [
  {
    title: "AI for Work & Career Readiness with Google AI Products",
    issuer: "Hacktiv8 · Maju Bareng AI",
    date: "15 May 2026",
    image: "/images/certificates/sertif1hacktiv8.jpg",
  },
];

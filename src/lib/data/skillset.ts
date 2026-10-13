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

export const certificates: Certificate[] = [];

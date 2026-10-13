export type NavItem = { href: string; label: string };

export type Project = {
  slug: string;
  title: string;
  role: string; 
  period: string; 
  summary: string;
  stack: string[]; 
  href?: string;
  repo?: string;
};

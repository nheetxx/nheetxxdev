type SocialIconProps = {
  label: "GitHub" | "LinkedIn" | "Instagram";
};

export function SocialIcon({ label }: SocialIconProps) {
  if (label === "GitHub") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-[#f0f6fc]">
        <path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.8 2.4 4.2 1.7.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11.2 11.2 0 0 1 5.8 0C18 5.3 19 5.6 19 5.6c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2v2.4c0 .3.2.6.8.5A11.1 11.1 0 0 0 12 .9Z" />
      </svg>
    );
  }

  if (label === "LinkedIn") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-[#0a66c2]">
        <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.9H4.98V9.4h2.95v9.5ZM6.46 8.1a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.46 10.8h-2.95v-4.62c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.2-1.77 2.43v4.7H9.72V9.4h2.83v1.3h.04c.39-.75 1.36-1.53 2.8-1.53 2.99 0 3.54 1.97 3.54 4.53v5.2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <defs>
        <linearGradient id="instagram-brand-gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#feda75" />
          <stop offset=".35" stopColor="#fa7e1e" />
          <stop offset=".65" stopColor="#d62976" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <path
        fill="url(#instagram-brand-gradient)"
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
      />
    </svg>
  );
}

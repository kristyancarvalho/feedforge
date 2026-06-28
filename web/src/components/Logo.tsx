interface LogoProps {
  size?: number;
  title?: string;
}

export function Logo({ size = 28, title = "FeedForge" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className="logo-mark"
    >
      <rect x="2" y="2" width="44" height="44" fill="var(--logo-bg)" />
      <path d="M14 10h22l-4 7H18v6h11l-4 7H18v8h-8z" fill="var(--logo-fg)" />
      <path d="M34 24l6 4-6 4-3-4z" fill="var(--logo-accent)" />
      <path d="M30 30l6 4-6 4-3-4z" fill="var(--logo-accent)" opacity="0.7" />
    </svg>
  );
}

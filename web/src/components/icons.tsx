import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props
  };
}

export function RadarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 8a4 4 0 1 0 4 4" />
      <path d="M12 12 20 4" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

export function SavedIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function SourcesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
      <circle cx="8" cy="5" r="1" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="8" cy="19" r="1" />
    </svg>
  );
}

export function RunsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 7v5l3 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function ScoreIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
    </svg>
  );
}

export function SourceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6a8 4 0 0 0 16 0" />
      <path d="M4 6v12a8 4 0 0 0 16 0V6" />
      <path d="M4 12a8 4 0 0 0 16 0" />
    </svg>
  );
}

export function LanguageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
    </svg>
  );
}

export function DateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5h14v15H5z" />
      <path d="M5 9h14" />
      <path d="M9 3v4" />
      <path d="M15 3v4" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 5h18l-7 8v6l-4-2v-4z" />
    </svg>
  );
}

export function SuccessIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

export function PartialIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FailureIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 2 20h20z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function CronIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2 2" />
      <path d="M12 3v2" />
      <path d="M21 12h-2" />
    </svg>
  );
}

export function ManualIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 4 14 8-14 8z" />
    </svg>
  );
}

export function TopicsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h10" />
      <path d="M4 12h16" />
      <path d="M4 17h7" />
    </svg>
  );
}

export function KeywordsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 7 3 12l4 5" />
      <path d="m17 7 4 5-4 5" />
      <path d="m14 4-4 16" />
    </svg>
  );
}

export function NotesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4h14v16H5z" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

export function DetailsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function ReloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 20v-4h4" />
    </svg>
  );
}

export function StatusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12h4l2 5 4-12 2 7h6" />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4 4 1.5 1.5" />
      <path d="M18.5 18.5 20 20" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4 20 1.5-1.5" />
      <path d="M18.5 5.5 20 4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

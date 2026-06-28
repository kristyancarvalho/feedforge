import { useId, useState, type ReactNode } from "react";
import { HelpIcon } from "./icons";

interface HelpTooltipProps {
  text: string;
  label: string;
  placement?: "top" | "bottom";
  children?: ReactNode;
}

export function HelpTooltip({ text, label, placement = "top" }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="help-tooltip">
      <button
        type="button"
        className="help-tooltip-trigger"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <HelpIcon />
      </button>
      <span id={id} role="tooltip" className="help-tooltip-bubble" data-placement={placement} data-open={open}>
        {text}
      </span>
    </span>
  );
}

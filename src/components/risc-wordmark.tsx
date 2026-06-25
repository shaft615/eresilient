import { Fragment } from "react";

type RiscWordmarkProps = {
  /** Full tool name, e.g. "riscScope™", "riscManager.com™", "BCP Readiness Scorecard". */
  name: string;
  /** Render on a dark background — the remainder flips from ink to paper. */
  onDark?: boolean;
  /** Extra classes (sizing, margins) applied to the wordmark wrapper. */
  className?: string;
};

// Every RISC-family tool name, longest-first so "riscManager.com" wins over
// "riscManager" during the inline scan. The trailing ™ is optional on each.
const TOOL_PATTERN =
  "riscManager\\.com™?|riscAnalysis™?|riscResponse™?|riscScope™?|riscManager™?";
const SPLIT_RE = new RegExp(`(${TOOL_PATTERN})`, "g");
const MATCH_RE = new RegExp(`^(?:${TOOL_PATTERN})$`);

/**
 * Split a single tool name into the brand lockup: a lowercase orange "risc"
 * followed by a near-black (or paper, on dark) remainder. Names that don't
 * start with "risc" render unchanged so the same helper can drive a mixed list.
 */
function splitName(name: string, onDark: boolean) {
  const hasTrademark = name.endsWith("™");
  const core = hasTrademark ? name.slice(0, -1) : name;
  const restTone = onDark ? "text-brand-paper" : "text-brand-ink";
  const tmTone = onDark ? "text-brand-taupe/70" : "text-brand-ink-light";

  const trademark = hasTrademark ? (
    <sup className={`ml-0.5 text-[0.5em] font-semibold ${tmTone}`}>™</sup>
  ) : null;

  if (!core.startsWith("risc")) {
    return (
      <>
        {core}
        {trademark}
      </>
    );
  }

  return (
    <>
      <span className="text-brand-orange">risc</span>
      <span className={restTone}>{core.slice(4)}</span>
      {trademark}
    </>
  );
}

/**
 * The RISC-family wordmark lockup, matching riscManager.com: an orange "risc"
 * prefix + ink remainder, set in the Outfit wordmark font at display weight.
 * Use for headings, cards, and hero titles.
 */
export function RiscWordmark({ name, onDark = false, className }: RiscWordmarkProps) {
  return (
    <span className={`font-wordmark font-bold tracking-tight ${className ?? ""}`}>
      {splitName(name, onDark)}
    </span>
  );
}

/**
 * Inline scanner for body copy: colorizes any RISC-family tool name found in a
 * run of text with the orange "risc" + ink remainder treatment, leaving the
 * surrounding prose untouched. Lighter weight than the display lockup so it
 * reads as an inline brand mark. `children` must be a plain string.
 */
export function RiscText({
  children,
  onDark = false,
}: {
  children: string;
  onDark?: boolean;
}) {
  const parts = children.split(SPLIT_RE);
  return (
    <>
      {parts.map((part, i) =>
        MATCH_RE.test(part) ? (
          <span key={i} className="font-wordmark font-semibold tracking-tight">
            {splitName(part, onDark)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

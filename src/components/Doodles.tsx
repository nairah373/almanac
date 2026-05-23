/**
 * Hand-drawn SVG doodles — student-notebook-style flourishes used as
 * decorative accents. Each takes Tailwind text-* colours via `currentColor`.
 */

type Props = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DoodleStar({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 20 3 L 23.5 14.5 L 35 14 L 26 22 L 30 34 L 20 27.5 L 10 34 L 14 22 L 5 14 L 16.5 14.5 Z" />
    </svg>
  );
}

export function DoodleSparkle({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 20 4 C 21 14, 26 19, 36 20 C 26 21, 21 26, 20 36 C 19 26, 14 21, 4 20 C 14 19, 19 14, 20 4 Z" />
    </svg>
  );
}

export function DoodleSquiggle({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 14"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 4 9 Q 18 2, 32 9 T 60 9 T 88 9 T 116 9" />
    </svg>
  );
}

export function DoodleArrow({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 70 50"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 4 8 C 22 6, 44 16, 56 38 M 56 38 L 48 32 M 56 38 L 62 28" />
    </svg>
  );
}

export function DoodleDots({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden={true}>
      <g fill="currentColor">
        <circle cx="8" cy="20" r="2.2" />
        <circle cx="20" cy="9" r="2.2" />
        <circle cx="32" cy="22" r="2.2" />
        <circle cx="14" cy="32" r="2.2" />
        <circle cx="28" cy="32" r="2.2" />
      </g>
    </svg>
  );
}

export function DoodleBolt({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 40"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 18 4 L 8 22 L 15 22 L 12 36 L 24 16 L 17 16 Z" />
    </svg>
  );
}

export function DoodleCircle({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 60"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 30 6 C 14 7, 7 18, 8 30 C 8 44, 18 53, 30 54 C 44 53, 52 42, 52 30 C 52 18, 42 6, 30 6" />
    </svg>
  );
}

const dashed = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeDasharray: "4 6",
};

/** A simple line-drawn paper plane, pointing right. */
export function DoodlePlane({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      aria-hidden={true}
      {...stroke}
    >
      <path d="M 58 20 L 3 5 L 24 21 L 3 35 Z" />
      <path d="M 24 21 L 58 20" />
    </svg>
  );
}

/** A loopy dashed flight-trail — goes left to right with one curl. */
export function DoodleTrail({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 60"
      aria-hidden={true}
      {...dashed}
    >
      <path d="M 4 52 C 18 52, 26 32, 26 20 C 26 8, 44 8, 44 22 C 44 36, 26 36, 30 22 C 36 6, 70 22, 116 12" />
    </svg>
  );
}

/** A standalone dashed loop-de-loop curl. */
export function DoodleLoop({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 50"
      aria-hidden={true}
      {...dashed}
    >
      <path d="M 4 40 C 12 40, 18 22, 18 14 C 18 6, 42 6, 42 20 C 42 34, 18 34, 26 20 C 36 4, 76 16, 76 40" />
    </svg>
  );
}

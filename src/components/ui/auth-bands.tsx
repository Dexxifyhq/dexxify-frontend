/**
 * Diagonal bands pinned to the bottom of a side panel. Shared by the (auth)
 * layout and the welcome page.
 *
 * Fills are currentColor, so the bands take their colour from the text colour
 * of whatever wraps them — that's what lets the same artwork sit on a light or
 * a dark panel. Varying opacity keeps the layering.
 * Decorative — the caller's container should be aria-hidden.
 */
export function AuthBands() {
  return (
    <svg
      viewBox="0 0 600 500"
      preserveAspectRatio="xMaxYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 w-full text-dash-border-strong"
    >
      <polygon points="0,500 60,470 120,500" fill="currentColor" opacity="0.35" />
      <polygon points="150,500 240,330 330,500" fill="currentColor" opacity="0.9" />
      <polygon points="270,500 330,330 420,390 400,500" fill="currentColor" opacity="0.35" />
      <polygon points="390,500 440,330 560,300 520,500" fill="currentColor" opacity="0.8" />
      <polygon points="470,500 600,160 600,500" fill="currentColor" opacity="0.45" />
      <polygon points="520,260 600,210 600,360" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

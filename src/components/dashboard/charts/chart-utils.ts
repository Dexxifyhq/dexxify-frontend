/**
 * Point on a circle of radius `r` centered at (cx, cy), where angleDeg is
 * measured so that 180° = left, 90° = top, 0° = right — i.e. sweeping
 * left → top → right traces the top semicircle (a "dome").
 */
export function arcPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/**
 * SVG path `d` for an arc from `startAngle` to `endAngle` (degrees, using the
 * convention above), sweeping clockwise on screen. Expects startAngle >= endAngle.
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = arcPoint(cx, cy, r, startAngle);
  const end = arcPoint(cx, cy, r, endAngle);
  const largeArcFlag = startAngle - endAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

import { ArrowUpRight } from "lucide-react";

/**
 * Announcement banner — dark card, copy on the left, artwork on the right.
 *
 * The artwork is an inline SVG rather than a photo so it stays on the ramp and
 * ships no asset. Fills are set via `style` rather than the `fill` attribute:
 * `fill="var(--n-500)"` is not honoured as a presentation attribute, only as a
 * CSS declaration.
 */
function Ridges() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dx-announce-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--n-400)" }} />
          <stop offset="100%" style={{ stopColor: "var(--n-700)" }} />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill="url(#dx-announce-sky)" />

      {/* Back range — lightest, reads as distance */}
      <polygon
        points="0,300 55,165 105,210 170,115 235,195 300,145 400,225 400,300"
        style={{ fill: "var(--n-300)" }}
        opacity="0.45"
      />
      {/* Mid range */}
      <polygon
        points="0,300 70,205 135,250 205,180 265,235 330,190 400,240 400,300"
        style={{ fill: "var(--n-500)" }}
        opacity="0.75"
      />
      {/* Front range — nearly the card colour, anchors the composition */}
      <polygon
        points="0,300 60,255 130,285 200,240 275,275 340,245 400,270 400,300"
        style={{ fill: "var(--n-900)" }}
      />
    </svg>
  );
}

export default function Announcement() {
  return (
    <section className="relative border-b border-border">
      {/* Same rail container as Hero — matching max-w keeps the vertical rules
          continuous down the page, so this width must track Hero's. The
          horizontal rule lives on the section so it spans the full viewport. */}
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="px-4 sm:px-6 py-6 shadow-sm">
          <div className="flex flex-col overflow-hidden rounded-xl bg-foreground md:flex-row">
            {/* Copy */}
            <div className="flex-1 p-8 sm:p-10">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-background">
                Announcing Dexxify, now in private beta
              </h2>
              <p className="mt-3 max-w-lg text-sm sm:text-base leading-relaxed text-background/70">
                One API for crypto payments, Naira settlement, swaps and KYC.
                Accept crypto from your customers or pay your users out —
                without stitching together five vendors.
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-background hover:gap-2.5 transition-all duration-200"
              >
                Read the announcement
                <ArrowUpRight size={14} />
              </a>
            </div>

            {/* Artwork — a band on mobile, a right panel from md */}
            <div className="relative h-32 w-full shrink-0 md:h-auto md:w-2/5 lg:w-1/3">
              <Ridges />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

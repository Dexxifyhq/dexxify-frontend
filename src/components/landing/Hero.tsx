/**
 * Homepage hero — black-and-white, Anchor-style.
 *
 * 1. Centred headline, subtext and one button.
 * 2. A band of soft grey "bricks" that drift slowly on both sides, with a
 *    statement line over them (centred on desktop, left-aligned on phones,
 *    where the bricks are smaller).
 *
 * Palette: #0A0A0A, #767676, #F2F2F2 and white. Font (DM Sans) comes from
 * the marketing layout.
 */

// Each row runs from the screen edge to `reach` (percent of the hero's
// width, measured from that edge), so the bricks bleed off both sides.
// `inner` lists fixed-width bricks (px) on the centre side of a row; the
// rest of the row is one brick that stretches to the edge.
type BrickRow = { reach: number; inner?: number[] };
const LEFT_ROWS: BrickRow[] = [{ reach: 16 }, { reach: 26 }, { reach: 22 }];
const RIGHT_ROWS: BrickRow[] = [
  { reach: 16, inner: [200] },
  { reach: 30 },
  { reach: 15.5 },
];

// Rows extend this far past the screen edge (clipped by the section), so the
// drift (up to 60px) never shows a gap at the edge.
const BLEED = 100;

function Bricks({ rows, side }: { rows: BrickRow[]; side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 md:gap-[14px]"
    >
      {rows.map((row, r) => (
        <div
          key={r}
          className={`flex gap-2 md:gap-[14px] ${left ? "flex-row-reverse" : ""}`}
          // Each row drifts on its own timing, so the rows fall out of sync.
          // globals.css stops these under prefers-reduced-motion.
          style={{
            width: `calc(${row.reach}% + ${BLEED}px)`,
            [left ? "marginLeft" : "marginRight"]: -BLEED,
            ...(left ? {} : { marginLeft: "auto" }),
            animation: `${left ? "brick-l" : "brick-r"} ${18 + r * 4}s ease-in-out ${r * 0.6}s infinite alternate`,
          }}
        >
          {/* Fixed-width inner bricks are desktop-only; on phones each row is
              a single brick. */}
          {row.inner?.map((width, i) => (
            <span
              key={i}
              className="hidden h-24 shrink-0 rounded-[20px] bg-[#F2F2F2] md:block"
              style={{ width }}
            />
          ))}
          <span className="h-10 flex-1 rounded-xl bg-[#F2F2F2] md:h-24 md:rounded-[20px]" />
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    // Mobile values follow the Anchor mobile reference: more room under the
    // navbar, a smaller subtext and button, and a left-aligned statement
    // over smaller bricks.
    <section className="relative overflow-hidden bg-white pt-20 md:pt-16">
      {/* 1 · Headline block */}
      <div className="mx-auto flex max-w-[980px] flex-col items-center px-6 text-center">
        <h1 className="text-[40px] font-normal leading-[1.12] tracking-[-1px] text-[#0A0A0A] md:text-[60px] md:leading-[1.06] md:tracking-[-2px]">
          Crypto payments and payouts
          <br className="hidden md:block" /> settled in Naira.
        </h1>

        {/* Desktop spacing measured from the reference: ~32px above and below
            the subtext, wrapping onto two lines. */}
        <p className="mt-6 max-w-[330px] text-[14px] leading-[21px] text-[#767676] md:mt-8 md:max-w-[660px] md:text-[17px] md:leading-[26px]">
          Dexxify gives businesses everything they need to accept crypto from
          customers anywhere, swap it at the live rate and pay out to any bank.
        </p>

        <a
          href="/register"
          className="mt-6 inline-flex items-center rounded-2xl bg-[#0A0A0A] px-8 py-4 text-[16px] font-medium leading-[24px] text-white transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] md:mt-8 md:px-12 md:py-5 md:text-[17px] md:leading-[26px]"
        >
          Get started
        </a>
      </div>

      {/* 2 · Brick band with statement. The statement starts level with the
          top row of bricks and sits over them. */}
      <div className="relative mt-14 md:mt-24 md:h-[316px]">
        <Bricks rows={LEFT_ROWS} side="left" />
        <Bricks rows={RIGHT_ROWS} side="right" />

        {/* PLACEHOLDER COPY — not from the live site; replace when final. */}
        <h2 className="relative mx-auto max-w-[1200px] px-4 pb-12 text-left text-[26px] font-normal leading-[1.18] tracking-[-0.5px] text-[#0A0A0A] md:px-6 md:pb-0 md:text-center md:text-[56px] md:leading-[1.22] md:tracking-[-1.5px]">
          Everything to accept, convert and settle crypto, all on one balance.
        </h2>
      </div>
    </section>
  );
}

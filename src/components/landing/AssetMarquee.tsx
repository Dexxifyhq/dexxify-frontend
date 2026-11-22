import Image from "next/image";

/**
 * Supported-asset logo strip, under the products cards.
 *
 * Only assets Dexxify actually supports appear here — a marquee on the homepage
 * reads as a support claim. public/crypto/ also holds ADA, AVAX, DOT, LTC and
 * MATIC, which are deliberately excluded. TRX and TON are supported but have no
 * logo in that folder yet; add them here once they do.
 */
const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", file: "btc" },
  { symbol: "ETH", name: "Ethereum", file: "eth" },
  { symbol: "USDT", name: "Tether", file: "usdt" },
  { symbol: "USDC", name: "USD Coin", file: "usdc" },
  { symbol: "SOL", name: "Solana", file: "sol" },
  { symbol: "BNB", name: "BNB", file: "bnb" },
];

/**
 * Copies of the list in the track. Must be even (the animation slides by half),
 * and half of it must be wider than the screen or a gap shows before the loop
 * wraps. The strip runs edge to edge, and one copy is ~1,200px wide, so three
 * copies per half covers screens up to ~3,600px.
 */
const COPIES = 6;

export default function AssetMarquee() {
  return (
    // Full-bleed strip, Anchor-style: logos run off both edges, no fade and
    // no border. Brand logos are full colour in the files; greyscale keeps
    // them on the black-and-white palette.
    <section className="relative">
      {/* The moving strip repeats every logo, so it's hidden from assistive
          tech and this single list is announced instead. */}
      <h2 className="sr-only">Supported assets</h2>
      <ul className="sr-only">
        {ASSETS.map((a) => (
          <li key={a.symbol}>
            {a.name} ({a.symbol})
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="marquee overflow-hidden py-6 sm:py-8">
        <div className="marquee-track flex items-center">
          {Array.from({ length: COPIES }, (_, copy) =>
            ASSETS.map((a) => (
              <div
                key={`${copy}-${a.symbol}`}
                className={`flex shrink-0 items-center gap-3 px-10 sm:px-12 ${
                  copy > 0 ? "marquee-dup" : ""
                }`}
              >
                <Image
                  src={`/crypto/${a.file}.svg`}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 grayscale"
                />
                <span className="text-[22px] font-semibold tracking-tight text-[#0A0A0A]">
                  {a.symbol}
                </span>
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

/**
 * Supported-asset logo strip, directly under the Hero.
 *
 * Only assets Dexxify actually supports appear here — a marquee on the homepage
 * reads as a support claim. public/cypto/ also holds ADA, AVAX, DOT, LTC and
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
 * and half of it must be wider than the 1200px container or a gap shows before
 * the loop wraps. Six items at ~180px each is ~1080px per copy, so two copies
 * per half.
 */
const COPIES = 4;

export default function AssetMarquee() {
  return (
    <section className="relative border-b border-border">
      <div className="max-w-[1200px] mx-auto border-x border-border">
        {/* The moving strip repeats every logo four times, so it's hidden from
            assistive tech and this single list is announced instead. */}
        <h2 className="sr-only">Supported assets</h2>
        <ul className="sr-only">
          {ASSETS.map((a) => (
            <li key={a.symbol}>
              {a.name} ({a.symbol})
            </li>
          ))}
        </ul>

        <div
          aria-hidden="true"
          className="marquee overflow-hidden py-6 sm:py-8 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          <div className="marquee-track flex items-center">
            {Array.from({ length: COPIES }, (_, copy) =>
              ASSETS.map((a) => (
                <div
                  key={`${copy}-${a.symbol}`}
                  className={`flex shrink-0 items-center gap-2.5 px-8 sm:px-10 ${
                    copy > 0 ? "marquee-dup" : ""
                  }`}
                >
                  {/* Brand logos are full colour; greyscale keeps them on the
                      monochrome ramp without editing the source files. */}
                  <Image
                    src={`/cypto/${a.file}.svg`}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 grayscale"
                  />
                  <span className="text-lg font-semibold tracking-tight text-foreground">
                    {a.symbol}
                  </span>
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

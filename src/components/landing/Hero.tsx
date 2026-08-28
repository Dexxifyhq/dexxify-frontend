import { Nunito } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FloatingLines from "./FloatingLines";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export default function Hero() {
  return (
    <section className={`relative overflow-hidden bg-mono-bg ${nunito.className}`}>
      {/* Ambient background texture — behind everything, never interactive-feeling */}
      <div className="absolute inset-0 z-0">
        <FloatingLines color="#71717A" opacity={0.08} density={6} speed={0.6} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto border-x border-mono-border/60">
        <div className="px-6 sm:px-10 pt-32 pb-28 lg:pt-40 lg:pb-36">
          <Badge asChild variant="outline" size="sm">
            <a href="#">
              Now in private beta
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </Badge>

          {/* Headline and subtext state the same claim — accept crypto, settle in
              fiat or stablecoins — at two levels of detail. Nothing introduced
              in one that isn't in the other. */}
          <h1 className="mt-8 max-w-[820px] text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight leading-[1.12] text-mono-fg">
            Accept crypto. Settle in fiat or stablecoins.
          </h1>
          <p className="mt-5 max-w-[560px] text-lg text-mono-muted leading-relaxed">
            A single API for businesses to accept crypto payments from customers
            and settle instantly in fiat or stablecoins.
          </p>

          <div className="flex items-center gap-3 mt-10 flex-wrap">
            <Button asChild variant="mono" size="lg" radius="full">
              <a href="/register">Get Started</a>
            </Button>
            <Button asChild variant="mono-outline" size="lg" radius="full">
              <a href="#">View Docs</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

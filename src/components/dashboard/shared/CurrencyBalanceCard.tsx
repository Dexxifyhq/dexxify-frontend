import { cn } from "@/utils/utils";

/**
 * Dark balance card for one currency: a near-black base lit by the
 * currency's own colour, with a Dexxify "D" watermark cropped off the
 * bottom-right. Used by the Overview carousel and the Balance page.
 *
 * The glow colours are the naira's flag green, Tether's green and USD Coin's
 * blue — third-party brand marks, like the coin logos, not our palette.
 */
export const CURRENCY_CARDS = [
  {
    key: "ngn" as const,
    code: "NGN",
    name: "Nigerian Naira",
    prefix: "₦",
    logo: "/currency/ngn.svg",
    glow: "#008751",
  },
  {
    key: "usdt" as const,
    code: "USDT",
    name: "Tether",
    prefix: "$",
    logo: "/crypto/usdt.svg",
    glow: "#26A17B",
  },
  {
    key: "usdc" as const,
    code: "USDC",
    name: "USD Coin",
    prefix: "$",
    logo: "/crypto/usdc.svg",
    glow: "#2775CA",
  },
];

export type CurrencyCardMeta = (typeof CURRENCY_CARDS)[number];

export default function CurrencyBalanceCard({
  currency,
  balance,
  loading,
  className,
  ...rest
}: {
  currency: CurrencyCardMeta;
  balance: number | undefined;
  loading?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "relative isolate flex min-h-40 flex-col justify-between overflow-hidden bg-(--n-900) p-5 text-white",
        className,
      )}
    >
      {/* Currency glow: one soft wash from the top-left, one tighter bloom
          behind the watermark. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 90% at 0% 0%, ${currency.glow}55 0%, transparent 60%), radial-gradient(60% 70% at 100% 100%, ${currency.glow}40 0%, transparent 70%)`,
        }}
      />
      {/* Dexxify D watermark, cropped off the bottom-right corner. The
          transparent logo is used as a mask so it can be tinted. */}
      <div
        aria-hidden
        className="absolute -bottom-10 -right-8 -z-10 h-44 w-44 -rotate-12 bg-white/[0.07]"
        style={{
          maskImage: "url(/logo-set/transparent-2.png)",
          WebkitMaskImage: "url(/logo-set/transparent-2.png)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      {/* Hairline highlight along the top edge. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-white/25 to-transparent"
      />

      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element -- static currency mark */}
        <img
          src={currency.logo}
          alt=""
          className="h-8 w-8 rounded-full ring-2 ring-white/15"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">{currency.code}</p>
          <p className="truncate text-[11px] text-white/55">{currency.name}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Available balance
        </p>
        {loading ? (
          <div className="mt-2 h-7 w-36 animate-pulse rounded bg-white/10" />
        ) : (
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-base text-white/60">{currency.prefix}</span>
            <span className="text-[28px] font-medium leading-none tracking-tight">
              {(balance ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

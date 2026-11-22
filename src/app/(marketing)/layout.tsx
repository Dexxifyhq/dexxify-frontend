import { DM_Sans } from "next/font/google";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";
import SiteAnalytics from "@/components/analytics/SiteAnalytics";

// Marketing site font. next/font self-hosts it at build time, so visitors
// never request Google Fonts. Variable font, so every weight is available.
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <div className={dmSans.className}>{children}</div>
      <SiteAnalytics />
    </SmoothScrollProvider>
  );
}

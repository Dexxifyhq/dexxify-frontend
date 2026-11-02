import SmoothScrollProvider from "@/providers/SmoothScrollProvider";
import SiteAnalytics from "@/components/analytics/SiteAnalytics";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      {children}
      <SiteAnalytics />
    </SmoothScrollProvider>
  );
}

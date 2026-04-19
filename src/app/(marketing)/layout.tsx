import SmoothScrollProvider from "@/providers/SmoothScrollProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}

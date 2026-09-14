import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import AssetMarquee from "@/components/landing/AssetMarquee";
import Announcement from "@/components/landing/Announcement";
import Infrastructure from "@/components/landing/Infrastructure";
import UseCases from "@/components/landing/UseCases";
import CodeShowcase from "@/components/landing/CodeShowcase";
import TrustSecurity from "@/components/landing/TrustSecurity";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />
      <Hero />
      <AssetMarquee />
      <Announcement />
      <Infrastructure />
      <UseCases />
      <CodeShowcase />
      <TrustSecurity />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import AssetMarquee from "@/components/landing/AssetMarquee";
import Announcement from "@/components/landing/Announcement";
import Infrastructure from "@/components/landing/Infrastructure";
import UseCases from "@/components/landing/UseCases";
import TrustSecurity from "@/components/landing/TrustSecurity";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />
      <Hero />
      <AssetMarquee />
      <Infrastructure />
      <UseCases />
      <TrustSecurity />
      <Announcement />
      <FAQ />
      <Footer />
    </main>
  );
}

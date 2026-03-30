import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import CheckoutFlow from "@/components/landing/CheckoutFlow";
import TwoProducts from "@/components/landing/TwoProducts";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import CodeShowcase from "@/components/landing/CodeShowcase";
import TrustSecurity from "@/components/landing/TrustSecurity";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-[#09090B] text-[#FAFAFA] min-h-screen">
      <Navbar />
      <Hero />
      <CheckoutFlow />
      <TwoProducts />
      <FeaturesGrid />
      <CodeShowcase />
      <TrustSecurity />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

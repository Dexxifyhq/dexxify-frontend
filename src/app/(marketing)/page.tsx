import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import TwoProducts from "@/components/landing/TwoProducts";
import HowItWorks from "@/components/landing/HowItWorks";
import CodeShowcase from "@/components/landing/CodeShowcase";
import WhoItsFor from "@/components/landing/WhoItsFor";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-[#09090B] text-[#FAFAFA] min-h-screen">
      <Navbar />
      <Hero />
      <TwoProducts />
      <HowItWorks />
      <CodeShowcase />
      <WhoItsFor />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

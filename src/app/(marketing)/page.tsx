import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import ProductModules from "@/components/landing/ProductModules";
import CodeShowcase from "@/components/landing/CodeShowcase";
import Comparison from "@/components/landing/Comparison";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-[#09090B] text-[#FAFAFA] min-h-screen">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <ProductModules />
      <CodeShowcase />
      <Comparison />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import ProductModules from "@/components/ProductModules";
import CodeShowcase from "@/components/CodeShowcase";
import Comparison from "@/components/Comparison";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

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

import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";
import { ABOUT } from "@/lib/content/about";

export const metadata: Metadata = {
  title: "About",
  description: ABOUT.intro,
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutPage />;
}

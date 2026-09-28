import type { Metadata } from "next";

// The root title template appends "— Dexxify". First-run setup is private to a
// signed-in owner, so it's kept out of search.
export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

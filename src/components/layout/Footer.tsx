import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { DOCS_URL } from "@/lib/constants/links";

const FOOTER_LINKS = {
  Products: [
    { label: "Payment Gateway", href: "#" },
    { label: "Offramp API", href: "#" },
    { label: "Webhooks", href: "#" },
    { label: "Sandbox", href: "#" },
  ],
  Developers: [
    { label: "Documentation", href: DOCS_URL },
    { label: "API Reference", href: "#" },
    { label: "SDKs", href: "#" },
    { label: "Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "AML Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

/**
 * Dark footer band. Layout follows the reference — wordmark on top, four link
 * columns, a hairline, then the small print — while the content is unchanged
 * from the previous footer.
 *
 * The inner width matches the page's 1200px rail container with the same px-6,
 * so the wordmark and columns line up with the section content above even
 * though the footer draws no rails of its own.
 */
export default function Footer() {
  return (
    <footer className="bg-foreground bg-dots-dark">
      <div className="max-w-[1200px] mx-auto px-6 py-16 sm:py-20">
        {/* Wordmark, tagline and quick links */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* White lockup — the footer band is dark. The navbar sits on
                white and uses the black version. */}
            <Image
              src="/logo-set/dexxify-transparent.png"
              alt="Dexxify"
              width={2103}
              height={748}
              className="h-8 w-auto"
            />
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-background/60">
              Crypto payments and payouts for Nigerian businesses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Docs", href: DOCS_URL },
              { label: "API Reference", href: "#" },
              { label: "Support", href: "#" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded border border-code-border px-2.5 py-1 text-xs text-background/60 hover:border-background/40 hover:text-background transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <nav
          aria-label="Footer"
          className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4"
        >
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-background">
                {category}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-background/60 hover:text-background transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Small print */}
        <div className="mt-12 flex flex-col gap-4 border-t border-code-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          {/* The homepage is prerendered, so this year is fixed at build time
              and rolls over on the next deploy after New Year. */}
          <p className="text-xs text-background/60">
            © {new Date().getFullYear()} Dexxify
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1 text-xs text-background/60 hover:text-background transition-colors"
            >
              FAQs <ArrowUpRight size={10} />
            </a>
            <a
              href="/register"
              className="flex items-center gap-1 text-xs text-background/60 hover:text-background transition-colors"
            >
              Get Started <ArrowUpRight size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DOCS_URL, PRODUCT_LINKS, type ProductLink } from "@/lib/constants/links";

// Pages that don't exist yet link to "#".
const COLUMNS: { title: string; links: ProductLink[] }[] = [
  {
    title: "Products",
    links: PRODUCT_LINKS, // same list as the navbar's Products menu
  },
  {
    title: "Developers",
    links: [{ label: "Docs", href: DOCS_URL }],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      // Point these at /privacy, /terms and /aml once those pages ship.
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "AML Policy", href: "#" },
    ],
  },
  {
    title: "Email",
    links: ["hello", "support", "compliance"].map((box) => ({
      label: `${box}@dexxify.com`,
      href: `mailto:${box}@dexxify.com`,
    })),
  },
];

/**
 * Footer — Anchor-style, black. A centred call-to-action band, four link
 * columns, the logo and tagline, then the copyright.
 *
 * The CTA copy is new: the heading came with the design brief, the paragraph
 * is the hero's subtext. The button goes where the hero's Get started does.
 */
export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      {/* Call to action. On phones (as on the Anchor mobile reference) the
          heading is as large as desktop and wraps onto two lines, and the
          paragraph is narrower, with less padding around the band. */}
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-6 pb-14 pt-16 text-center lg:pb-20 lg:pt-24">
        <h2 className="max-w-[260px] text-[32px] font-medium leading-[1.15] tracking-[-0.6px] lg:max-w-none">
          Start building with Dexxify
        </h2>
        <p className="mt-4 max-w-[280px] text-[14px] leading-[1.7] text-[#A3A3A3] lg:max-w-[440px]">
          Dexxify gives businesses everything they need to accept crypto from
          customers anywhere, swap it at the live rate and pay out to any bank.
        </p>
        <a
          href="/register"
          className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-[10px] text-[14px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#E5E5E5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Get started
          {/* A drawn icon rather than a text arrow, which some phones
              render as an emoji. */}
          <ArrowRight
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="transition-transform duration-200 motion-safe:group-hover:translate-x-[3px]"
          />
        </a>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 lg:px-0">
        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[13px] font-medium text-white">{col.title}</h3>
              <ul className="mt-5 flex flex-col gap-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.soon ? (
                      // Not available yet: shown, but not a link.
                      <span className="flex items-center gap-2 text-[15px] text-[#5C5C5C]">
                        {link.label}
                        <span className="rounded-full bg-[#1F1F1F] px-2 py-0.5 text-[11px] font-medium text-[#9A9A9A]">
                          Soon
                        </span>
                      </span>
                    ) : (
                      <a
                        href={link.href}
                        className="break-all text-[15px] text-[#9A9A9A] transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none sm:break-normal"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Brand row: white lockup (the navbar uses the black one) and the
            company's legal line. */}
        <div className="mt-16 flex max-w-[360px] flex-col gap-3 pb-14">
          <Image
            src="/logo-set/dexxify-transparent.png"
            alt="Dexxify"
            width={2103}
            height={748}
            className="h-6 w-auto self-start"
          />
          <p className="text-[13px] leading-[1.6] text-[#7A7A7A]">
            Dexxify Ltd provides crypto payment and settlement
            software for businesses. Dexxify is not a bank.
          </p>
        </div>

        {/* Bottom bar. The homepage is prerendered, so the year is fixed at
            build time and rolls over on the next deploy after New Year. */}
        <div className="border-t border-[#1F1F1F] py-7 text-[13px] text-[#5C5C5C]">
          © {new Date().getFullYear()} Dexxify
        </div>
      </div>
    </footer>
  );
}

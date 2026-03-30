import { ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = {
  Products: [
    { label: "Payment Gateway", href: "#" },
    { label: "Offramp API", href: "#" },
    { label: "Webhooks", href: "#" },
    { label: "Sandbox", href: "#" },
  ],
  Developers: [
    { label: "Documentation", href: "#" },
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

export default function Footer() {
  return (
    <footer className="border-t border-[#1C1C1F] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="text-[#FAFAFA] font-bold text-xl tracking-tight mb-3">Dexxify</div>
            <p className="text-[#71717A] text-sm leading-relaxed max-w-xs">
              Crypto payments and payouts for Nigerian businesses.
            </p>
            <div className="flex gap-2 mt-4">
              {["Docs", "API Reference", "Support"].map(link => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-[#71717A] border border-[#1C1C1F] px-2.5 py-1 rounded hover:border-[#2563EB]/40 hover:text-[#FAFAFA] transition-all duration-200"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-4">{category}</div>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#1C1C1F] gap-4">
          <p className="text-xs text-[#71717A]">
            © 2025 Dexxify · Built in Nigeria 🇳🇬
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors flex items-center gap-1">
              FAQs <ArrowUpRight size={10} />
            </a>
            <a href="#" className="text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors flex items-center gap-1">
              Get Started <ArrowUpRight size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

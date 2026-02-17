import Link from "next/link";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/waspaero/",
  },
  {
    label: "CEO's LinkedIn",
    href: "https://www.linkedin.com/in/jan-david-ridder-86035218b/",
  },
];

const legalLinks = [
  { label: "Legal Notice", href: "/legal/legal-notice" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Shipping", href: "/legal/shipping" },
  { label: "Data Protection", href: "/legal/data-protection" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--color-border)] mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Two-column split */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          {/* Column A — Socials */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary/30">
              Connect
            </span>
            <div className="flex gap-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary/40 hover:text-accent-b transition-colors duration-300"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Divider — vertical on desktop, horizontal on mobile */}
          <div className="hidden sm:block w-px self-stretch bg-primary/10" />
          <div className="block sm:hidden h-px w-full bg-primary/10" />

          {/* Column B — Legal */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary/30">
              Legal
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-mono text-xs text-primary/40 hover:text-accent-b transition-colors duration-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-14 pt-6 border-t border-[var(--color-border)]">
          <p className="font-mono text-[10px] text-primary/25 tracking-widest text-center">
            &copy; {year} WASP AERODYNAMICS LAB. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}

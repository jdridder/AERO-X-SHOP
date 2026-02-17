import { notFound } from "next/navigation";
import { legalPages, legalSlugs } from "../content";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return legalSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) return {};
  return {
    title: `${page.title} — WASP AERODYNAMICS`,
    description: page.subtitle,
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) notFound();

  return (
    <>
      {/* Header */}
      <header className="mb-14">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary/30 mb-3">
          {page.subtitle}
        </p>
        <h1 className="font-[family-name:var(--font-oxanium)] text-3xl sm:text-4xl font-bold tracking-tight text-primary">
          {page.title}
        </h1>
        <p className="mt-3 font-mono text-[11px] text-primary/25 tracking-wider">
          Last updated {page.lastUpdated}
        </p>
      </header>

      {/* Sections */}
      <div className="space-y-10">
        {page.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="font-mono text-sm font-semibold tracking-wide text-primary/70 mb-4">
                {section.heading}
              </h2>
            )}
            <div className="space-y-2">
              {section.body.map((line, j) => (
                <p
                  key={j}
                  className="font-mono text-[13px] leading-relaxed text-primary/50"
                >
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

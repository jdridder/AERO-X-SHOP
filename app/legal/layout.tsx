export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-40 pb-24">
      <article className="w-full max-w-prose font-mono text-primary/80 leading-relaxed">
        {children}
      </article>
    </div>
  );
}

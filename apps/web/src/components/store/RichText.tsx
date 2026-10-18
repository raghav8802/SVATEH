import { cleanHtml } from "@/lib/sanitize";

export function RichText({ html, className = "" }: { html?: string | null; className?: string }) {
  const clean = cleanHtml(html);
  if (!clean) return null;
  return <div className={`prose-svateh ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-ink/10" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-display text-xl [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-2xl leading-none text-violet transition group-open:rotate-45" aria-hidden>
          +
        </span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

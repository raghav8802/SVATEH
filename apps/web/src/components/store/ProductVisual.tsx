import Image from "next/image";

const BGS = ["var(--blush)", "var(--gold)", "var(--violet)", "#EADFE5", "var(--plum)"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Shows the product photo when one has been uploaded; otherwise a branded
 * packshot illustration (from the original SVATEH visual identity) so the
 * store never looks broken while photography is pending.
 */
export function ProductVisual({
  name,
  image,
  hex,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority,
  className = "",
  label,
}: {
  name: string;
  image?: string;
  hex?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  label?: string;
}) {
  // Callers often position the visual absolutely; only default to `relative` otherwise.
  const pos = /\b(absolute|fixed)\b/.test(className) ? "" : "relative";
  if (image) {
    return (
      <div className={`${pos} overflow-hidden bg-[#EFE7EC] ${className}`}>
        <Image src={image} alt={name} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const bg = BGS[hash(name) % BGS.length];
  const words = (label ?? name).replace(/^the\s+/i, "").toUpperCase().split(/\s+/).slice(0, 3);
  return (
    <div className={`${pos} flex items-center justify-center overflow-hidden ${className}`} style={{ background: bg }} role="img" aria-label={name}>
      <div className="relative flex h-[58%] w-[38%] items-center justify-center rounded-[15px] border border-ink/20 bg-white shadow-[13px_20px_32px_rgba(38,23,50,.25)]">
        <div className="absolute -top-[9%] left-1/2 h-[10%] w-2/3 -translate-x-1/2 rounded-t-[13px] rounded-b-[4px] bg-plum" />
        <span className="px-2 text-center font-display text-[clamp(11px,1.6vw,17px)] leading-[1.05] text-violet">
          {words.map((w, i) => (
            <span key={i} className="block">
              {w}
            </span>
          ))}
        </span>
        {hex ? <span className="absolute bottom-[12%] h-3 w-3 rounded-full border border-ink/10" style={{ background: hex }} /> : null}
      </div>
    </div>
  );
}

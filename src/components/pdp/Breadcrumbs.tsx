import Link from "next/link";

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Lips" },
  { href: "/product", label: "Lip & Cheek Tint" },
];

export function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
      <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-svate-espresso/60">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">&gt;</span>}
              {isLast ? (
                <span className="text-svate-espresso/80" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-svate-gold"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

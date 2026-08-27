import {
  Sparkles,
  Leaf,
  Layers,
  FlaskConical,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

const badges: { label: string; icon: LucideIcon }[] = [
  { label: "Minimal Makeup", icon: Sparkles },
  { label: "Clean Beauty", icon: Leaf },
  { label: "Multifunctional", icon: Layers },
  { label: "Indian Skin Tested", icon: FlaskConical },
  { label: "Cruelty Free", icon: HeartHandshake },
];

export function BrandBadges() {
  return (
    <section className="border-y border-[#E9DDCF]/50 bg-svateh-beige/30 py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:gap-10 sm:px-6 lg:justify-between lg:gap-6 lg:px-8">
        {badges.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-svateh-espresso"
          >
            <Icon className="h-5 w-5 shrink-0 text-svateh-gold" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-wider sm:text-sm">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { listRoutines } from "@svateh/db";
import { LookBuilder } from "@/components/store/LookBuilder";
import { RichText } from "@/components/store/RichText";
import { EmptyState, PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Shop the routine", description: "Simple beauty systems — products that work together, in the order to apply them." };

export default async function RoutinesPage() {
  const routines = await listRoutines();
  return (
    <>
      <PageHero eyebrow="Shop the routine" title={"Simple steps.\nComplete looks."} intro="Each routine shows what’s included, why the products work together and the order to apply them." tone="violet" />
      {routines.length ? (
        routines.map((r: any, i: number) => (
          <section key={r._id} id={r.slug} className={`scroll-mt-24 py-16 sm:py-20 ${i % 2 ? "bg-plum text-white" : "bg-cream"}`}>
            <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr]">
              <div>
                <p className={`eyebrow ${i % 2 ? "" : "!text-violet"}`}>{r.summary}</p>
                <h2 className="display mt-4 text-[clamp(44px,6vw,84px)]">{r.name}</h2>
                <p className="mt-4 text-sm opacity-75">{r.steps.map((s: any) => s.title).join(" → ")}</p>
                <RichText html={r.description} className={`mt-6 max-w-md ${i % 2 ? "!text-white/85" : ""}`} />
              </div>
              <LookBuilder steps={r.steps} dark={i % 2 === 1} />
            </div>
          </section>
        ))
      ) : (
        <EmptyState title="Routines are coming soon" cta={{ label: "Shop all", href: "/shop" }} />
      )}
    </>
  );
}

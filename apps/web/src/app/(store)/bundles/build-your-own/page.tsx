import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getByob } from "@svateh/db";
import { ByobBuilder } from "@/components/store/Bundles";
import { PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Build your own bag" };

export default async function ByobPage() {
  const cfg: any = await getByob();
  if (!cfg || !cfg.steps?.length) notFound();
  return (
    <>
      <PageHero eyebrow="Build your own" title={cfg.title} intro={cfg.intro} tone="violet" />
      <section className="bg-cream py-16">
        <div className="container-x">
          <ByobBuilder steps={cfg.steps} discountType={cfg.discountType} discountValue={cfg.discountValue ?? 0} />
        </div>
      </section>
    </>
  );
}

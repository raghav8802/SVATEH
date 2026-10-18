import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-plum text-white">
      <div className="container-x flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="eyebrow mb-6">404</p>
        <h1 className="display text-[clamp(56px,9vw,128px)]">Lost in the glow.</h1>
        <p className="mt-6 max-w-md text-white/80">We couldn’t find that page. It may have moved — or it’s still in the making.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop" className="btn-blush">Shop the edit</Link>
          <Link href="/" className="btn-outline">Go home</Link>
        </div>
      </div>
    </section>
  );
}

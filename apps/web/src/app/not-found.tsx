import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-plum p-8 text-center text-white">
      <p className="eyebrow mb-6">404</p>
      <h1 className="display text-6xl">Page not found</h1>
      <Link href="/" className="btn-blush mt-10">Go home</Link>
    </main>
  );
}

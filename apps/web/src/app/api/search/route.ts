import { listProducts } from "@svateh/db";
import { handler, json } from "@/lib/api";

export const GET = handler(async (req: Request) => {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return json({ items: [] });
  const items = await listProducts({ q, limit: 8 });
  return json({ items: items.map((p) => ({ name: p.name, slug: p.slug, tagline: p.tagline, price: p.price, image: p.images[0] ?? "", hex: p.variants[0]?.hex ?? "" })) });
});

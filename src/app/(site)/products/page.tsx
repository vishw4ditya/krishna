import { connectToDatabase } from "@/src/lib/db";
import { Product } from "@/src/models/Product";
import { ProductCard } from "@/src/components/product-card";
import { SiteHeader } from "@/src/components/site-header";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: "latest" | "price_asc" | "price_desc";
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  await connectToDatabase();

  const query: Record<string, unknown> = { status: "active" };
  if (params.q) query.title = { $regex: params.q, $options: "i" };
  if (params.category) query.category = params.category;

  const sortMap = {
    latest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  } as const;

  const products = await Product.find(query)
    .populate("branchId", "name")
    .sort(sortMap[params.sort ?? "latest"])
    .limit(60)
    .lean();

  const categories = await Product.distinct("category");

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Products</h1>

        <form className="mt-4 grid gap-3 rounded-xl border bg-white p-4 dark:bg-zinc-950 md:grid-cols-4">
          <input name="q" defaultValue={params.q} placeholder="Search products" className="input" />
          <select name="category" defaultValue={params.category ?? ""} className="input">
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={params.sort ?? "latest"} className="input">
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button className="rounded-md bg-zinc-900 px-4 text-white dark:bg-zinc-100 dark:text-black">Apply</button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={String(product._id)} product={{ ...product, _id: String(product._id) }} />
          ))}
        </div>
      </main>
    </div>
  );
}

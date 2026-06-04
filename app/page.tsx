export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectToDatabase } from "@/src/lib/db";
import { Product } from "@/src/models/Product";
import { Branch } from "@/src/models/Branch";
import { ProductCard } from "@/src/components/product-card";
import { SiteHeader } from "@/src/components/site-header";

export default async function HomePage() {
  await connectToDatabase();

  const [featuredProducts, branches] = await Promise.all([
    Product.find({ status: "active" }).populate("branchId", "name").sort({ createdAt: -1 }).limit(8).lean(),
    Branch.find({ status: "active" }).sort({ name: 1 }).limit(6).lean(),
  ]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-700 p-8 text-white">
          <h1 className="text-4xl font-bold">Multi-Branch Shopping Experience</h1>
          <p className="mt-3 max-w-2xl text-zinc-200">
            Explore products across branches, connect directly with branch support, and manage your orders from one platform.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/products" className="rounded-md bg-white px-4 py-2 font-medium text-black">
              Shop Products
            </Link>
            <Link href="/auth/signin" className="rounded-md border border-white/40 px-4 py-2">
              Sign In
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={String(product._id)} product={{ ...product, _id: String(product._id) }} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Active Branches</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <article key={String(branch._id)} className="rounded-xl border bg-white p-4 dark:bg-zinc-950">
                <h3 className="font-semibold">{branch.name}</h3>
                <p className="text-sm text-zinc-500">Code: {branch.code}</p>
                <p className="mt-2 text-sm">{branch.address}</p>
                <p className="text-sm">{branch.phone}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

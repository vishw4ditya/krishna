export const dynamic = "force-dynamic";

import Image from "next/image";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/db";
import { currency } from "@/src/lib/format";
import { Product } from "@/src/models/Product";
import { SiteHeader } from "@/src/components/site-header";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const session = await getAuthSession();

  const product = await Product.findById(id)
    .populate("branchId", "_id name code address phone branchHeadId")
    .populate("createdBy", "_id name profileImage")
    .lean();

  if (!product) notFound();

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {product.images.map((image: string, i: number) => (
              <Image
                key={`${image}-${i}`}
                src={image}
                alt={product.title}
                className="h-72 w-full rounded-xl object-cover"
                width={900}
                height={520}
                unoptimized
              />
            ))}
          </div>

          <section className="space-y-4 rounded-xl border bg-white p-5 dark:bg-zinc-950">
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-300">{product.description}</p>
            <p className="text-2xl font-bold text-emerald-600">{currency(product.price)}</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Branch:</span> {(product.branchId as { name: string }).name}
              </p>
              <p>
                <span className="font-medium">Branch Head:</span> {(product.createdBy as { name: string }).name}
              </p>
            </div>

            {session?.user?.role === "customer" ? (
              <form action="/api/chats" method="post" className="space-y-2">
                <input type="hidden" name="branchHeadId" value={String((product.createdBy as { _id: string })._id)} />
                <input type="hidden" name="branchId" value={String((product.branchId as { _id: string })._id)} />
                <button className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-black" formAction={`/dashboard/customer?startChat=${id}`}>
                  Chat Support
                </button>
              </form>
            ) : (
              <p className="text-sm text-zinc-500">Sign in as customer to start chat support.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

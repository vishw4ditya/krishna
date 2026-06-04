import { redirect } from "next/navigation";
import { getAuthSession } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/db";
import { SiteHeader } from "@/src/components/site-header";
import { Product } from "@/src/models/Product";
import { User } from "@/src/models/User";
import { ChatPanel } from "@/src/components/chat-panel";

export default async function BranchHeadDashboardPage() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "branch_head") redirect("/auth/signin");
  if (session.user.approvalStatus !== "approved") redirect("/auth/pending");

  await connectToDatabase();
  const [profile, products] = await Promise.all([
    User.findById(session.user.id).populate("branchId", "name code").lean(),
    Product.find({ branchId: session.user.branchId }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <h1 className="text-3xl font-bold">Branch Head Dashboard</h1>

        <section className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="mt-2">{profile?.name}</p>
          <p>{profile?.email}</p>
          <p>Branch: {(profile?.branchId as { name: string } | null)?.name ?? "Unassigned"}</p>
        </section>

        <section className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Branch Products</h2>
          <div className="mt-3 space-y-2 text-sm">
            {products.map((product) => (
              <div key={String(product._id)} className="rounded-md border p-3">
                <p className="font-medium">{product.title}</p>
                <p>Status: {product.status}</p>
                <p>Price: ${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Customer Support Chat</h2>
          <div className="mt-4">
            <ChatPanel userId={session.user.id} />
          </div>
        </section>
      </main>
    </div>
  );
}

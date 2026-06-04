export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { connectToDatabase } from "@/src/lib/db";
import { getAuthSession } from "@/src/lib/auth";
import { StatCard } from "@/src/components/stat-card";
import { SiteHeader } from "@/src/components/site-header";
import { Branch } from "@/src/models/Branch";
import { Order } from "@/src/models/Order";
import { Product } from "@/src/models/Product";
import { User } from "@/src/models/User";

export default async function AdminDashboardPage() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "super_admin") redirect("/auth/signin");

  await connectToDatabase();
  const [stats, pendingHeads, branches, products, users] = await Promise.all([
    Promise.all([
      Branch.countDocuments(),
      User.countDocuments({ role: "branch_head", approvalStatus: "approved" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
    ]),
    User.find({ role: "branch_head", approvalStatus: "pending" }).populate("branchId", "name code").lean(),
    Branch.find().sort({ createdAt: -1 }).lean(),
    Product.find().populate("branchId", "name").sort({ createdAt: -1 }).limit(20).lean(),
    User.find().sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Branches" value={stats[0]} />
          <StatCard title="Branch Heads" value={stats[1]} />
          <StatCard title="Customers" value={stats[2]} />
          <StatCard title="Products" value={stats[3]} />
          <StatCard title="Orders" value={stats[4]} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Pending Branch Heads</h2>
            <div className="mt-3 space-y-3 text-sm">
              {pendingHeads.length === 0 && <p>No pending approvals.</p>}
              {pendingHeads.map((user) => (
                <form key={String(user._id)} className="rounded-md border p-3">
                  <p className="font-medium">{user.name}</p>
                  <p>{user.email}</p>
                  <p>
                    Branch: {(user.branchId as { name: string; code: string } | null)?.name ?? "N/A"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      formAction={`/api/branch-heads/${String(user._id)}/approval`}
                      className="rounded-md bg-emerald-600 px-3 py-1 text-white"
                    >
                      Approve
                    </button>
                    <button
                      formAction={`/api/branch-heads/${String(user._id)}/approval`}
                      className="rounded-md bg-red-600 px-3 py-1 text-white"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </article>

          <article className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Branches</h2>
            <div className="mt-3 space-y-2 text-sm">
              {branches.map((branch) => (
                <div key={String(branch._id)} className="rounded-md border p-3">
                  <p className="font-medium">{branch.name}</p>
                  <p>{branch.code}</p>
                  <p>{branch.status}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Recent Products</h2>
            <div className="mt-3 space-y-2 text-sm">
              {products.map((product) => (
                <div key={String(product._id)} className="rounded-md border p-3">
                  <p className="font-medium">{product.title}</p>
                  <p>Branch: {(product.branchId as { name: string })?.name ?? "N/A"}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <div className="mt-3 space-y-2 text-sm">
              {users.map((user) => (
                <div key={String(user._id)} className="rounded-md border p-3">
                  <p className="font-medium">{user.name}</p>
                  <p>{user.email}</p>
                  <p>{user.role}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

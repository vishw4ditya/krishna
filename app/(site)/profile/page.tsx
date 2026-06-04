export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthSession } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/db";
import { Order } from "@/src/models/Order";
import { User } from "@/src/models/User";
import { SiteHeader } from "@/src/components/site-header";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/auth/signin");

  await connectToDatabase();
  const [user, orders] = await Promise.all([
    User.findById(session.user.id).populate("branchId", "name code").lean(),
    Order.find({ customerId: session.user.id }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <section className="mt-5 rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <p>
            <span className="font-medium">Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {user?.role}
          </p>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Order History</h2>
          <div className="mt-3 space-y-3 text-sm">
            {orders.length === 0 && <p>No orders yet.</p>}
            {orders.map((order) => (
              <article key={String(order._id)} className="rounded-md border p-3">
                <p>Order #{String(order._id).slice(-6).toUpperCase()}</p>
                <p>Status: {order.status}</p>
                <p>Total: ${order.totalAmount.toFixed(2)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

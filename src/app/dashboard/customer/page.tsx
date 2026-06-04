import { redirect } from "next/navigation";
import { getAuthSession } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/db";
import { SiteHeader } from "@/src/components/site-header";
import { Order } from "@/src/models/Order";
import { Product } from "@/src/models/Product";
import { ChatPanel } from "@/src/components/chat-panel";

export default async function CustomerDashboardPage() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "customer") redirect("/auth/signin");

  await connectToDatabase();
  const [orders, savedProducts] = await Promise.all([
    Order.find({ customerId: session.user.id }).sort({ createdAt: -1 }).lean(),
    Product.find({ status: "active" }).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>

        <section className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <div className="mt-3 space-y-2 text-sm">
            {orders.length === 0 && <p>No orders placed yet.</p>}
            {orders.map((order) => (
              <div key={String(order._id)} className="rounded-md border p-3">
                <p>#{String(order._id).slice(-6).toUpperCase()}</p>
                <p>Status: {order.status}</p>
                <p>Total: ${order.totalAmount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Suggested Products</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {savedProducts.map((product) => (
              <div key={String(product._id)} className="rounded-md border p-3">
                <p className="font-medium">{product.title}</p>
                <p>{product.category}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold">Active Chats</h2>
          <div className="mt-4">
            <ChatPanel userId={session.user.id} />
          </div>
        </section>
      </main>
    </div>
  );
}

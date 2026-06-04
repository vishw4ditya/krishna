import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { getAuthSession } from "@/src/lib/auth";
import { Order } from "@/src/models/Order";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const filters = session.user.role === "customer" ? { customerId: session.user.id } : {};
  const orders = await Order.find(filters).sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "customer") {
    return NextResponse.json({ error: "Only customers can place orders" }, { status: 403 });
  }

  const body = await request.json();
  if (!Array.isArray(body.products) || body.products.length === 0) {
    return NextResponse.json({ error: "products required" }, { status: 400 });
  }

  const totalAmount = body.products.reduce(
    (sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price,
    0
  );

  await connectToDatabase();
  const order = await Order.create({
    customerId: session.user.id,
    products: body.products,
    totalAmount,
    status: "pending",
  });

  return NextResponse.json(order, { status: 201 });
}

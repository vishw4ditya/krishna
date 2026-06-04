import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { getAuthSession } from "@/src/lib/auth";
import { productSchema } from "@/src/lib/validators";
import { Product } from "@/src/models/Product";

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const branchId = searchParams.get("branchId");
  const status = searchParams.get("status") ?? "active";

  const filters: Record<string, unknown> = {};
  if (q) filters.title = { $regex: q, $options: "i" };
  if (category) filters.category = category;
  if (branchId) filters.branchId = branchId;
  if (status) filters.status = status;

  const products = await Product.find(filters)
    .populate("branchId", "name code")
    .populate("createdBy", "name profileImage")
    .sort({ createdAt: -1 });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["super_admin", "branch_head"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (session.user.role === "branch_head" && session.user.branchId !== parsed.data.branchId) {
    return NextResponse.json({ error: "Cannot create products for another branch" }, { status: 403 });
  }

  await connectToDatabase();
  const product = await Product.create({ ...parsed.data, createdBy: session.user.id });
  return NextResponse.json(product, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { getAuthSession } from "@/src/lib/auth";
import { productSchema } from "@/src/lib/validators";
import { Product } from "@/src/models/Product";

async function canEditProduct(userId: string, role: string, branchId: string | undefined, productId: string) {
  const product = await Product.findById(productId);
  if (!product) return { error: NextResponse.json({ error: "Product not found" }, { status: 404 }) };

  if (role === "super_admin") return { product };
  if (role === "branch_head" && branchId && String(product.branchId) === branchId) return { product };

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const product = await Product.findById(id)
    .populate("branchId", "name code address phone")
    .populate("createdBy", "name profileImage");
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { id } = await params;
  const access = await canEditProduct(session.user.id, session.user.role, session.user.branchId, id);
  if (access.error) return access.error;

  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (
    session.user.role === "branch_head" &&
    parsed.data.branchId &&
    parsed.data.branchId !== session.user.branchId
  ) {
    return NextResponse.json({ error: "Cannot reassign branch" }, { status: 403 });
  }

  const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true });
  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { id } = await params;
  const access = await canEditProduct(session.user.id, session.user.role, session.user.branchId, id);
  if (access.error) return access.error;

  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

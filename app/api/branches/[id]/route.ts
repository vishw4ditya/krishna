import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { requireRole } from "@/src/lib/guards";
import { branchSchema } from "@/src/lib/validators";
import { Branch } from "@/src/models/Branch";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["super_admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = branchSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const branch = await Branch.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  return NextResponse.json(branch);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["super_admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await connectToDatabase();
  const branch = await Branch.findByIdAndDelete(id);
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

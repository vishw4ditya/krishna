import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { requireRole } from "@/src/lib/guards";
import { branchSchema } from "@/src/lib/validators";
import { Branch } from "@/src/models/Branch";

export async function GET() {
  await connectToDatabase();
  const branches = await Branch.find().sort({ createdAt: -1 });
  return NextResponse.json(branches);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(["super_admin"]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = branchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const branch = await Branch.create({ ...parsed.data, code: parsed.data.code.toUpperCase() });
  return NextResponse.json(branch, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { requireRole } from "@/src/lib/guards";
import { Branch } from "@/src/models/Branch";
import { User } from "@/src/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["super_admin"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const status = body.status;

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findByIdAndUpdate(id, { approvalStatus: status }, { new: true });
  if (!user) return NextResponse.json({ error: "Branch head not found" }, { status: 404 });

  if (status === "approved" && user.branchId) {
    await Branch.findByIdAndUpdate(user.branchId, { branchHeadId: user._id });
  }

  return NextResponse.json(user);
}

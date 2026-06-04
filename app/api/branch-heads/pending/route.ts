import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { requireRole } from "@/src/lib/guards";
import { User } from "@/src/models/User";

export async function GET() {
  const auth = await requireRole(["super_admin"]);
  if (auth.error) return auth.error;

  await connectToDatabase();
  const users = await User.find({ role: "branch_head", approvalStatus: "pending" })
    .populate("branchId", "name code")
    .sort({ createdAt: -1 });

  return NextResponse.json(users);
}

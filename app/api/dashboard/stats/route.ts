import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { requireRole } from "@/src/lib/guards";
import { Branch } from "@/src/models/Branch";
import { Order } from "@/src/models/Order";
import { Product } from "@/src/models/Product";
import { User } from "@/src/models/User";

export async function GET() {
  const auth = await requireRole(["super_admin"]);
  if (auth.error) return auth.error;

  await connectToDatabase();
  const [totalBranches, totalBranchHeads, totalCustomers, totalProducts, totalOrders] = await Promise.all([
    Branch.countDocuments(),
    User.countDocuments({ role: "branch_head", approvalStatus: "approved" }),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.countDocuments(),
  ]);

  return NextResponse.json({
    totalBranches,
    totalBranchHeads,
    totalCustomers,
    totalProducts,
    totalOrders,
  });
}

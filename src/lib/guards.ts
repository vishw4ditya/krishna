import { NextResponse } from "next/server";
import { getAuthSession } from "@/src/lib/auth";
import type { UserRole } from "@/src/types/auth";

export async function requireRole(roles: UserRole[]) {
  const session = await getAuthSession();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!roles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}

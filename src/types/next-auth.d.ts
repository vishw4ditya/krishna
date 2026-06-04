import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/src/types/auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      branchId?: string;
      approvalStatus?: string;
    };
  }

  interface User {
    role: UserRole;
    branchId?: string;
    approvalStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    branchId?: string;
    approvalStatus?: string;
  }
}

import Link from "next/link";
import { getAuthSession } from "@/src/lib/auth";

export async function SiteHeader() {
  const session = await getAuthSession();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          Krishna Commerce
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products">Products</Link>
          <Link href="/profile">Profile</Link>
          {session?.user?.role === "super_admin" && <Link href="/dashboard/admin">Admin</Link>}
          {session?.user?.role === "branch_head" && <Link href="/dashboard/branch-head">Branch Head</Link>}
          {session?.user?.role === "customer" && <Link href="/dashboard/customer">Dashboard</Link>}
          <Link href="/auth/signin">{session?.user ? "Switch Account" : "Sign In"}</Link>
        </nav>
      </div>
    </header>
  );
}

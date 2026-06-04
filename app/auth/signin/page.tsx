import Link from "next/link";
import { SignInForm } from "@/src/components/signin-form";
import { SiteHeader } from "@/src/components/site-header";

export default function SignInPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="mt-2 text-sm text-zinc-500">Super Admin and Branch Head use email/password. Customers can use Google OAuth.</p>
        <div className="mt-5 rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <SignInForm />
        </div>
        <p className="mt-4 text-sm">
          Branch Head?{" "}
          <Link href="/auth/register-branch-head" className="underline">
            Register here
          </Link>
        </p>
      </main>
    </div>
  );
}

import Link from "next/link";
import { SiteHeader } from "@/src/components/site-header";

export default function PendingPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Registration Submitted</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          Your Branch Head registration is pending super admin approval.
        </p>
        <Link href="/auth/signin" className="mt-8 inline-block rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-black">
          Back to Sign In
        </Link>
      </main>
    </div>
  );
}

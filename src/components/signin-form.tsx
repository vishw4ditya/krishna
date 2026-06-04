"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCredentialSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    const callback = params.get("callbackUrl") ?? "/";
    router.push(callback);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onCredentialSubmit} className="grid gap-3">
        <input name="email" type="email" placeholder="Email" className="input" required />
        <input name="password" type="password" placeholder="Password" className="input" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-md bg-zinc-900 py-2 text-white dark:bg-zinc-100 dark:text-black" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard/customer" })}
        className="w-full rounded-md border border-zinc-300 py-2 text-sm"
      >
        Continue with Google
      </button>
    </div>
  );
}

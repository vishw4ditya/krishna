"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Branch = { _id: string; name: string; code: string };

export function BranchHeadRegistrationForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      profileImage: String(formData.get("profileImage") ?? ""),
      branchId: String(formData.get("branchId") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const res = await fetch("/api/auth/register-branch-head", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Registration failed" }));
      setError(data.error ?? "Registration failed");
      return;
    }

    router.push("/auth/pending");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input name="fullName" placeholder="Full Name" className="input" required />
      <input name="email" type="email" placeholder="Email" className="input" required />
      <input name="phone" placeholder="Phone Number" className="input" required />
      <input name="profileImage" type="url" placeholder="Profile Image URL" className="input" />
      <select name="branchId" className="input" required>
        <option value="">Select Branch</option>
        {branches.map((branch) => (
          <option key={branch._id} value={branch._id}>
            {branch.name} ({branch.code})
          </option>
        ))}
      </select>
      <input name="password" type="password" placeholder="Password" className="input" required minLength={8} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded-md bg-zinc-900 py-2 text-white dark:bg-zinc-100 dark:text-black" disabled={loading}>
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}

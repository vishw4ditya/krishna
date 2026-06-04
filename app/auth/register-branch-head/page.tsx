export const dynamic = "force-dynamic";

import { SiteHeader } from "@/src/components/site-header";
import { BranchHeadRegistrationForm } from "@/src/components/branch-head-registration-form";
import { connectToDatabase } from "@/src/lib/db";
import { Branch } from "@/src/models/Branch";

export default async function BranchHeadRegisterPage() {
  await connectToDatabase();
  const branches = await Branch.find({ status: "active" }).select("name code").sort({ name: 1 }).lean();

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-3xl font-bold">Branch Head Registration</h1>
        <p className="mt-2 text-sm text-zinc-500">Your account will remain pending until approved by super admin.</p>
        <div className="mt-5 rounded-xl border bg-white p-5 dark:bg-zinc-950">
          <BranchHeadRegistrationForm
            branches={branches.map((branch) => ({
              _id: String(branch._id),
              name: branch.name,
              code: branch.code,
            }))}
          />
        </div>
      </main>
    </div>
  );
}

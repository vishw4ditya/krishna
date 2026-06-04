import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { branchHeadRegistrationSchema } from "@/src/lib/validators";
import { User } from "@/src/models/User";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = branchHeadRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const exists = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (exists) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const password = await bcrypt.hash(parsed.data.password, 10);

  const user = await User.create({
    name: parsed.data.fullName,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
    profileImage: parsed.data.profileImage,
    branchId: parsed.data.branchId,
    password,
    role: "branch_head",
    approvalStatus: "pending",
  });

  return NextResponse.json({ id: user._id }, { status: 201 });
}

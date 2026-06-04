import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { getAuthSession } from "@/src/lib/auth";
import { Chat } from "@/src/models/Chat";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const filters =
    session.user.role === "customer"
      ? { customerId: session.user.id }
      : session.user.role === "branch_head"
        ? { branchHeadId: session.user.id }
        : {};

  const chats = await Chat.find(filters)
    .populate("customerId", "name profileImage")
    .populate("branchHeadId", "name profileImage")
    .populate("branchId", "name code")
    .sort({ updatedAt: -1 });

  return NextResponse.json(chats);
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "customer") {
    return NextResponse.json({ error: "Only customers can start chats" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.branchHeadId || !body.branchId) {
    return NextResponse.json({ error: "branchHeadId and branchId required" }, { status: 400 });
  }

  await connectToDatabase();
  let chat = await Chat.findOne({
    customerId: session.user.id,
    branchHeadId: body.branchHeadId,
    branchId: body.branchId,
  });

  if (!chat) {
    chat = await Chat.create({
      customerId: session.user.id,
      branchHeadId: body.branchHeadId,
      branchId: body.branchId,
      messages: [],
    });
  }

  return NextResponse.json(chat, { status: 201 });
}

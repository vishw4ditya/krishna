import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db";
import { getAuthSession } from "@/src/lib/auth";
import { chatMessageSchema } from "@/src/lib/validators";
import { Chat } from "@/src/models/Chat";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (!parsed.data.text && !parsed.data.image) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const chat = await Chat.findById(id);
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const participants = [String(chat.customerId), String(chat.branchHeadId)];
  if (!participants.includes(session.user.id) && session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  chat.messages.push({
    senderId: session.user.id,
    text: parsed.data.text,
    image: parsed.data.image,
    readBy: [session.user.id],
  });

  await chat.save();
  return NextResponse.json(chat.messages.at(-1), { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const messageId = body.messageId as string | undefined;
  if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

  await connectToDatabase();
  const { id } = await params;
  const chat = await Chat.findById(id);
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const message = chat.messages.id(messageId);
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const reads = new Set((message.readBy ?? []).map(String));
  reads.add(session.user.id);
  message.readBy = Array.from(reads);

  await chat.save();
  return NextResponse.json({ success: true });
}

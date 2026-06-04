import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/src/lib/auth";
import { cloudinary } from "@/src/lib/cloudinary";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const upload = await cloudinary.uploader.upload(dataUri, {
    folder: "krishna",
    resource_type: "image",
  });

  return NextResponse.json({ url: upload.secure_url });
}

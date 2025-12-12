import { uploadImageAssets } from "@/lib/upload-image";
import { NextRequest, NextResponse } from "next/server";
import { protectApiRoute, validateFileUpload } from "@/lib/api-security";

export const dynamic = "force-dynamic";

export const config = {
  api: { bodyParser: false }, // Disable default body parsing
};

export async function POST(req: NextRequest) {
  // Security: Require authentication and rate limit uploads
  const protection = await protectApiRoute({
    requireAuth: true,
    rateLimit: {
      maxRequests: 10, // 10 uploads per window
      windowMs: 60 * 1000, // 1 minute
    },
  });

  if (!protection.authorized || protection.response) {
    return protection.response;
  }

  try {
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file using centralized security utility
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const validation = validateFileUpload(file, {
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Additional security: Check file content (magic bytes) matches extension
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check magic bytes for common image formats
    const magicBytes = buffer.slice(0, 4).toString("hex");
    const isValidImage =
      magicBytes.startsWith("ffd8ff") || // JPEG
      magicBytes === "89504e47" || // PNG
      magicBytes.startsWith("474946") || // GIF
      magicBytes.startsWith("52494646"); // WebP (RIFF)

    if (!isValidImage) {
      return NextResponse.json(
        { error: "File content does not match image format" },
        { status: 400 }
      );
    }

    // Generate a secure filename with user ID to prevent overwrites
    const fileExt = file.name.split(".").pop() || "png";
    const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${protection.userId}/${timestamp}-${randomString}.${sanitizedExt}`;

    // Upload the file
    const url = await uploadImageAssets(buffer, filename);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}

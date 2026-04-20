import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET /api/settings — fetch current user's settings
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true },
    });

    // Mask the key for display — only return whether it exists + last 4 chars
    const key = user?.geminiApiKey;
    return NextResponse.json({
      hasApiKey: Boolean(key),
      apiKeyPreview: key ? `••••••••${key.slice(-4)}` : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/settings — save or clear the user's Gemini API key
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { geminiApiKey } = body as { geminiApiKey: string | null };

    // Basic validation if a key is provided
    if (geminiApiKey && !geminiApiKey.startsWith("AIza")) {
      return NextResponse.json(
        { error: "Invalid API key format. Gemini keys start with 'AIza'." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { geminiApiKey: geminiApiKey ?? null },
    });

    const saved = geminiApiKey ?? null;
    return NextResponse.json({
      success: true,
      hasApiKey: Boolean(saved),
      apiKeyPreview: saved ? `••••••••${saved.slice(-4)}` : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

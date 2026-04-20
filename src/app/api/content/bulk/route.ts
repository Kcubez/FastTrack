import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ids, action } = body as { ids: string[]; action: "publish" | "delete" };

    if (!ids || !Array.isArray(ids) || !action) {
      return NextResponse.json({ error: "ids and action are required" }, { status: 400 });
    }

    const isAdmin = session.user.role === "admin";

    // Verify ownership of all items
    const contents = await prisma.content.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    });

    if (!isAdmin) {
      const unauthorized = contents.some((c) => c.userId !== session.user.id);
      if (unauthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "publish") {
      await prisma.content.updateMany({
        where: { id: { in: ids } },
        data: { status: "published" },
      });
    } else if (action === "delete") {
      await prisma.content.deleteMany({ where: { id: { in: ids } } });
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

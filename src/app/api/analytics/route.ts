import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = session.user.role === "admin";
    const userId = isAdmin ? undefined : session.user.id;

    const where = userId ? { userId } : {};

    const [total, published, draft] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.count({ where: { ...where, status: "published" } }),
      prisma.content.count({ where: { ...where, status: "draft" } }),
    ]);

    // Weekly content (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekly = await prisma.content.count({
      where: { ...where, createdAt: { gte: sevenDaysAgo } },
    });

    // Daily content for last 14 days (for line chart)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const dailyContents = await prisma.content.findMany({
      where: { ...where, createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dailyMap: Record<string, { date: string; total: number; published: number; draft: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { date: key, total: 0, published: 0, draft: 0 };
    }
    for (const c of dailyContents) {
      const key = c.createdAt.toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].total++;
        if (c.status === "published") dailyMap[key].published++;
        else dailyMap[key].draft++;
      }
    }
    const dailyData = Object.values(dailyMap);

    // Platform distribution
    const platformGroups = await prisma.content.groupBy({
      by: ["platform"],
      where,
      _count: { platform: true },
    });
    const platformData = platformGroups.map((g) => ({
      platform: g.platform,
      count: g._count.platform,
    }));

    // User stats for admin
    let userStats = null;
    if (isAdmin) {
      const totalUsers = await prisma.user.count();
      const contentGenerators = await prisma.user.count({ where: { role: "user" } });
      userStats = { totalUsers, contentGenerators };
    }

    // Latest content
    const recentContents = await prisma.content.findMany({
      where,
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, platform: true, status: true, createdAt: true },
    });

    return NextResponse.json({
      total, published, draft, weekly,
      dailyData, platformData, userStats, recentContents
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

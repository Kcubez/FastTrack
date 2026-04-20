// Content creation & management API routes

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const outputLanguage = searchParams.get("outputLanguage");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const isAdmin = session.user.role === "admin";

    const where: Record<string, unknown> = {};
    if (!isAdmin) where.userId = session.user.id;
    if (status) where.status = status;
    if (platform) where.platform = platform;
    if (outputLanguage) where.outputLanguage = outputLanguage;
    
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate + "T23:59:59") }),
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brief: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({ contents, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      title, brief, platform, contentGoal, targetAudience, customAudience,
      writingTone, contentLength, customWordCount, outputLanguage,
      ctaType, hashtagPreference, customHashtags, keywords, wordsToAvoid,
      negativeConstraints, emojiEnabled, imageUrl, generatedContent, status,
    } = body;

    const content = await prisma.content.create({
      data: {
        userId: session.user.id,
        title, brief, platform, contentGoal, targetAudience,
        customAudience, writingTone, contentLength,
        customWordCount: customWordCount ? parseInt(customWordCount) : null,
        outputLanguage, ctaType, hashtagPreference, customHashtags,
        keywords, wordsToAvoid, negativeConstraints,
        emojiEnabled: emojiEnabled ?? true,
        imageUrl, generatedContent,
        status: status ?? "draft",
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

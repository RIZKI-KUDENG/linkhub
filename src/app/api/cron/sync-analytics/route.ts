import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";


export const dynamic = 'force-dynamic';

type LogItem = {
  linkId: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
  country: string;
  city: string;
  createdAt: Date;
}

export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const authHeader = req.headers.get("authorization");
  
  if (!isDev && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const logs: any[] | null = await redis.lpop("analytics:queue", 100);

    if (!logs || logs.length === 0) {
      return NextResponse.json({ message: "No data to sync" });
    }

    const parsedLogs = logs.map((log) => {
      return typeof log === 'string' ? JSON.parse(log) : log;
    });

    const uniqueLinkIds = [...new Set(parsedLogs.map((log: any) => log.linkId))] as string[];

    const existingLinks = await prisma.link.findMany({
      where: {
        id: { in: uniqueLinkIds },
      },
      select: { id: true },
    });

    const validLinkIds = new Set(existingLinks.map((l) => l.id));

    const dataToInsert = parsedLogs
      .filter((log: any) => validLinkIds.has(log.linkId))
      .map((parsed: any) => ({
        linkId: parsed.linkId,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        referrer: parsed.referrer,
        country: parsed.country,
        city: parsed.city,
        createdAt: new Date(parsed.createdAt),
      }));

    if (dataToInsert.length === 0) {
      return NextResponse.json({ message: "Data found in Redis but all associated links were deleted from DB." });
    }
    await prisma.linkClicks.createMany({
      data: dataToInsert,
    });
    const clicksPerLink = dataToInsert.reduce((acc: Record<string, number>, curr: LogItem) => {
      acc[curr.linkId] = (acc[curr.linkId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    await Promise.all(
      Object.entries(clicksPerLink).map(([linkId, count]) =>
        prisma.link.update({
          where: { id: linkId },
          data: { 
            clicks: { increment: count as number } 
          },
        })
      )
    );

    return NextResponse.json({ 
      message: `Success. Processed ${logs.length} logs. Inserted ${dataToInsert.length} valid records.` 
    });

  } catch (error) {
    console.error("Sync failed detailed error:", error);
    return NextResponse.json({ error: "Sync failed", details: String(error) }, { status: 500 });
  }
}
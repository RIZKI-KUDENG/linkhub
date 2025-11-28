import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
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
    const logs: any[] | null = await redis.lpop("analytics:queue", 1000);

    if (!logs || logs.length === 0) {
      return NextResponse.json({ message: "No data to sync" });
    }

    const dataToInsert = logs.map((log) => {
      const parsed = typeof log === 'string' ? JSON.parse(log) : log;

      return {
        linkId: parsed.linkId,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        referrer: parsed.referrer,
        country: parsed.country,
        city: parsed.city,
        createdAt: new Date(parsed.createdAt), 
      };
    });
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
      message: `Synced ${logs.length} logs and updated counters` 
    });

  } catch (error) {
    console.error("Sync failed detailed error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
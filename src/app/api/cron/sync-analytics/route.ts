import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
 
    const logs: string[] | null = await redis.lpop("analytics:queue", 1000);

    if (!logs || logs.length === 0) {
      return NextResponse.json({ message: "No data to sync" });
    }

    const dataToInsert = logs.map((log) => {
      const parsed = JSON.parse(log);
      return {
        linkId: parsed.linkId,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        referrer: parsed.referrer,
        country: parsed.country,
        city: parsed.city,
        createdAt: parsed.createdAt, 
      };
    });
    await prisma.linkClicks.createMany({
      data: dataToInsert,
    });
    
    return NextResponse.json({ message: `Synced ${logs.length} logs` });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
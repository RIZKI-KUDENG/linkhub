import { NextResponse, userAgent } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
const link = await prisma.link.findUnique({
  where: { id },
    select: { url: true },
})
if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
const trackingPromise = (async () => {
    try {
      const { device, browser, os } = userAgent(req);
      const referer = req.headers.get("referer") || "Direct";
      const country = req.headers.get("x-vercel-ip-country") || "Unknown";
      const city = req.headers.get("x-vercel-ip-city") || "Unknown";

      const logData = {
        linkId: id,
        device: device.type || "desktop",
        browser: browser.name,
        os: os.name,
        referrer: referer,
        country,
        city,
        createdAt: new Date().toISOString(),
      };
      const pipeline = redis.pipeline();
      pipeline.incr(`link:clicks:${id}`); 
      pipeline.rpush("analytics:queue", JSON.stringify(logData)); 
      await pipeline.exec();
    } catch (err) {
      console.error("Redis tracking error", err);
    }
  })();
  return NextResponse.redirect(link.url);
}
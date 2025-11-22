import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";

const getAnalytics = unstable_cache(
  async (linkId: string) => {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { clicks: true },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [dailyClicks, devices, referrers, locations] = await Promise.all([
      prisma.linkClicks.groupBy({
        by: ["createdAt"],
        where: {
          linkId,
          createdAt: { gte: sevenDaysAgo },
        },
        _count: { id: true },
      }),
      prisma.linkClicks.groupBy({
        by: ["device"],
        where: { linkId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.linkClicks.groupBy({
        by: ["referrer"],
        where: { linkId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      prisma.linkClicks.groupBy({
        by: ["country"],
        where: { linkId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);
    const chartData = dailyClicks.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + curr._count.id;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalClicks: link?.clicks || 0,
      chartData,
      devices,
      referrers,
      locations,
    };
  },
  ["link-analytics-data"], 
  { revalidate: 300 } 
);

export async function GET(
  req: Request,
  props: { params: Promise<{ linkId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { linkId } = params;

  const link = await prisma.link.findFirst({
    where: { id: linkId, userId: session.user.id },
    select: { id: true }, 
  });

  if (!link) {
    return NextResponse.json(
      { error: "Link not found or unauthorized" },
      { status: 404 }
    );
  }
  const data = await getAnalytics(linkId);

  return NextResponse.json(data);
}
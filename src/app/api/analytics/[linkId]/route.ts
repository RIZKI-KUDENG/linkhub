import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  // Validasi kepemilikan link
  const link = await prisma.link.findFirst({
    where: { id: linkId, userId: session.user.id },
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found or unauthorized" }, { status: 404 });
  }

  // --- AGGREGATION QUERIES ---

  // 1. Grafik Klik per Hari (7 Hari Terakhir)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyClicks = await prisma.linkClicks.groupBy({
    by: ['createdAt'],
    where: {
      linkId,
      createdAt: { gte: sevenDaysAgo },
    },
    _count: { id: true },
  });

  const chartData = dailyClicks.reduce((acc, curr) => {
    const date = curr.createdAt.toISOString().split('T')[0]; 
    acc[date] = (acc[date] || 0) + curr._count.id;
    return acc;
  }, {} as Record<string, number>);


  const devices = await prisma.linkClicks.groupBy({
    by: ['device'],
    where: { linkId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const referrers = await prisma.linkClicks.groupBy({
    by: ['referrer'],
    where: { linkId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5, 
  });

  const locations = await prisma.linkClicks.groupBy({
    by: ['country'],
    where: { linkId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  return NextResponse.json({
    totalClicks: link.clicks,
    chartData, 
    devices,   
    referrers,
    locations,
  });
}
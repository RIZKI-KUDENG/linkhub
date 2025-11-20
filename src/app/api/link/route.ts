import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.link.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const link = await prisma.link.create({
    data: {
      url: data.url,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      category: data.category,
      userId: session.user.id,
    },
  });

  return NextResponse.json(link);
}

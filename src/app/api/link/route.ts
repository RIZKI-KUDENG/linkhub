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

  try {
    const link = await prisma.link.create({
        data: {
        url: data.url,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        type: data.type || "CLASSIC",
        userId: session.user.id,
        isSensitive: data.isSensitive || false,
        password: data.password || null,
        },
    });
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}

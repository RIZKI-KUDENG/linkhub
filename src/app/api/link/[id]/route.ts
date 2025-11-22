import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(link);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  try {
    let passwordUpdate = undefined;
    if (data.password) {
      passwordUpdate = await hash(data.password, 10);
    } else if (data.password === "") {
      passwordUpdate = null;
    }
    const updated = await prisma.link.update({
      where: { id, userId: session.user.id },
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        type: data.type,
        sortOrder: data.sortOrder,
        isSensitive: data.isSensitive,
        ...(data.password !== undefined && { password: passwordUpdate }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.link.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}

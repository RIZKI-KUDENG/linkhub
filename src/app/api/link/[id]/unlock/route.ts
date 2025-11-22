import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;
  const { password } = await req.json();

  const link = await prisma.link.findUnique({
    where: { id },
    select: { password: true, url: true }
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (!link.password) {
     return NextResponse.json({ url: `/api/link/${id}/click` });
  }
  const isValid = await compare(password, link.password);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({ url: `/api/link/${id}/click` });
}
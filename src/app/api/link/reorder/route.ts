import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orders } = await req.json();

  if (!Array.isArray(orders)) {
    return NextResponse.json(
      { error: "Invalid body format" },
      { status: 400 }
    );
  }

  try {
    const updates = orders.map((item) =>
      prisma.link.update({
        where: {
          id: item.id,
          userId: session.user.id, 
        },
        data: {
          sortOrder: item.sortOrder,
        },
      })
    );
    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to reorder links" },
      { status: 500 }
    );
  }
}

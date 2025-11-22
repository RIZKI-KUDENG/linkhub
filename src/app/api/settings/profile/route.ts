import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username tidak boleh kurang dari 3 karakter")
    .max(20, "Username tidak boleh lebih dari 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, dan underscore"),
  name: z.string().min(1, "Nama tidak boleh kosong"),
  bio: z
    .string()
    .max(160, "Bio tidak boleh lebih dari 160 karakter")
    .optional(),
  image: z.url("URL gambar tidak valid").optional(),
  theme: z.string().optional(),
  customTitle: z.string().max(60, "Title maksimal 60 karakter").optional(),
  customDescription: z
    .string()
    .max(160, "Description maksimal 160 karakter")
    .optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        theme: true,
        customTitle: true,
        customDescription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const result = profileSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );

    const {
      username,
      name,
      bio,
      image,
      theme,
      customTitle,
      customDescription,
    } = result.data;
    if (username !== session.user.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing)
        return NextResponse.json(
          { error: "Username sudah digunakan" },
          { status: 409 }
        );
    }
    const updateUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        name,
        bio,
        image: image || null,
        theme: theme,
        customTitle,
        customDescription,
      },
    });
    return NextResponse.json(updateUser);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { username },
    include: { links: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Avatar
  const avatar =
    user.image ??
    "https://avatars.githubusercontent.com/u/000000?v=4";

  const totalLinks = user.links.length;

  // Load fonts
  const interRegular = await fetch("file:///mnt/data/OGFont-Regular.ttf").then(
    (res) => res.arrayBuffer()
  );
  const interBold = await fetch("file:///mnt/data/OGFont-Bold.ttf").then(
    (res) => res.arrayBuffer()
  );

  // Satori object tree (NO JSX!)
  const ogTree = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "linear-gradient(135deg, #4f46e5, #9333ea)",
        color: "white",
        padding: "40px",
        textAlign: "center",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "img",
          props: {
            src: avatar,
            width: 160,
            height: 160,
            style: {
              borderRadius: "100%",
              border: "4px solid white",
              marginBottom: "20px",
            },
          },
        },
        {
          type: "div",
          props: {
            children: `@${user.username}`,
            style: {
              fontSize: "48px",
              fontWeight: 700,
              marginBottom: "10px",
              fontFamily: "Inter",
            },
          },
        },
        {
          type: "div",
          props: {
            children: `${totalLinks} curated links`,
            style: {
              fontSize: "28px",
              opacity: 0.9,
              fontFamily: "Inter",
            },
          },
        },
      ],
    },
  };

  const svg = await satori(ogTree as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: interRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: interBold,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const png = new Resvg(svg).render().asPng();

  return new NextResponse(png as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

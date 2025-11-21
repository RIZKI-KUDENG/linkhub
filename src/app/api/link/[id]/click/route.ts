import { NextResponse, userAgent } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  try {
    // 1. Parse User Agent untuk mendapatkan Device, OS, Browser
    const { device, browser, os } = userAgent(req);
    
    // 2. Ambil Referer (dari mana user datang)
    const referer = req.headers.get("referer") || "Direct";
    
    // 3. Ambil Lokasi (Hanya bekerja jika dideploy ke Vercel/Platform yang support header ini)
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";

    // 4. Jalankan Database Transaction:
    //    - Update total clicks di tabel Link (supaya counter cepat)
    //    - Buat record baru di LinkClick (untuk data detail)
    const link = await prisma.$transaction(async (tx) => {
      const updatedLink = await tx.link.update({
        where: { id },
        data: {
          clicks: { increment: 1 },
        },
        select: { url: true },
      });

      await tx.linkClicks.create({
        data: {
          linkId: id,
          device: device.type || "desktop", // userAgent device.type usually returns 'mobile', 'tablet', or undefined (desktop)
          browser: browser.name,
          os: os.name,
          referrer: referer,
          country: country,
          city: city,
        },
      });

      return updatedLink;
    });

    // 5. Redirect user ke URL tujuan
    return NextResponse.redirect(link.url);
    
  } catch (err) {
    console.error("Click tracking failed:", err);
    // Tetap redirect user meskipun tracking gagal agar UX tidak terganggu
    // Kita perlu fetch URL aslinya dulu jika update gagal (fallback)
    const link = await prisma.link.findUnique({ 
        where: { id }, 
        select: { url: true } 
    });
    
    if (link) return NextResponse.redirect(link.url);
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
}
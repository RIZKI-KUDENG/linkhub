
import { NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const { result } = await ogs({
      url,
      fetchOptions: {
        headers: {
          "User-Agent":
            "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      timeout: 10000, 
    });

    let finalImage = result.ogImage?.[0]?.url;
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
       const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
       if (ytMatch && (!finalImage || result.ogTitle === "- YouTube")) {
          finalImage = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
       }
    }

    return NextResponse.json({
      title: result.ogTitle, 
      description: result.ogDescription,
      image: finalImage,
    });
  } catch (error) {
    console.error("Scrape Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil metadata" }, 
      { status: 500 }
    );
  }
}
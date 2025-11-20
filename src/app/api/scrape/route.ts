//
//Kode ini menerima sebuah URL, 
// mengambil metadata (seperti judul, deskripsi, dan gambar) dari URL tersebut,
//  dan mengirimkannya kembali ke klien.
//

import { NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export async function POST(req: Request) {
  const { url } = await req.json();

  const { result } = await ogs({ url });

  return NextResponse.json({
    title: result.ogTitle,
    description: result.ogDescription,
    image: result.ogImage?.[0].url,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: Request, props: { params: Promise<{id: string}> }) {
    
    const params = await props.params;

    try{
        const {id} = params
        const link = await prisma.link.update({
            where: {id},
            data: {
                clicks: {
                    increment: 1
                }
            },
            select: {
                url: true
            }
        })

        return NextResponse.redirect(link.url)
    }catch(err){
        console.error(err)
        return NextResponse.json({error: "Failed to update link"}, {status: 500})
    }
}
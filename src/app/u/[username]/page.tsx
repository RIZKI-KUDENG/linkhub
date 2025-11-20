import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import MasonryClient from "@/components/fragments/MasonryClient";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username },
    include: { links: true },
  });
  console.log(user?.image);

  if (!user) {
    return {
      title: "User tidak ditemukan · LinkHub",
      description: "Profil tidak ditemukan.",
    };
  }

  return {
    title: `@${user.username} · LinkHub`,
    description: `Lihat koleksi link, tools, dan portfolio dari @${user.username}.`,
    openGraph: {
      title: `@${user.username} · LinkHub`,
      description: `Lihat koleksi link visual dari @${user.username}.`,
      images: [
        `/api/og?username=${user.username}`
      ],
      url: `https://linkhub.app/u/${user.username}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `@${user.username} · LinkHub`,
      description: `Lihat koleksi link visual dari @${user.username}.`,
      images: [
        `/api/og?username=${user.username}`
      ],
    },
  };
}




export default async function PublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      links: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen relative bg-white p-6">
      <div className="max-w-2xl mx-auto mt-10">
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.image ? (
              <Image
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                src={user.image}
                alt={user.name || "Profile"}
                className="w-full h-full rounded-full object-cover border-2 border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">@{user.name}</h1>
        </div>
        <MasonryClient>
          {user.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              className="block mb-4 bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition border"
            >
              {link.imageUrl && (
                <img
                  src={link.imageUrl}
                  className="w-full object-cover"
                  alt={link.title ?? link.url}
                />
              )}

              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1">
                  {link.title ?? link.url}
                </h3>

                {link.description && (
                  <p className="text-xs text-gray-500 line-clamp-3">
                    {link.description}
                  </p>
                )}
              </div>
            </a>
          ))}

          {user.links.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              <p>Belum ada link yang ditampilkan.</p>
            </div>
          )}
        </MasonryClient>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import MasonryClient from "@/components/fragments/MasonryClient";
import { Metadata } from "next";
import { ThemeKey, themes } from "@/lib/theme";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
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
      images: [`/api/og?username=${user.username}`],
      url: `https://linkhub.app/u/${user.username}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `@${user.username} · LinkHub`,
      description: `Lihat koleksi link visual dari @${user.username}.`,
      images: [`/api/og?username=${user.username}`],
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
  const themeKey = (user.theme as ThemeKey) || "default";
  const theme = themes[themeKey] || themes.default;
  return (
    <div
      className={cn(
        "min-h-screen relative p-6 transition-colors duration-300",
        theme.bg
      )}
    >
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
              <div
                className={cn(
                  "w-full h-full rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20",
                  theme.card,
                  theme.text
                )}
              >
                {user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <h1 className={cn("text-2xl font-bold mb-2", theme.text)}>
            @{user.name}
          </h1>
          {user.bio && (
            <p
              className={cn("text-sm opacity-90 max-w-md mx-auto", theme.text)}
            >
              {user.bio}
            </p>
          )}
        </div>
        <MasonryClient>
          {user.links.map((link) => (
            <a
              key={link.id}
              href={`/api/link/${link.id}/click`}
              target="_blank"
              className={cn(
                "block mb-4 rounded-xl overflow-hidden transition-all duration-300 transform",
                theme.card,
                theme.cardHover
              )}
            >
              {link.imageUrl && (
                <img
                  src={link.imageUrl}
                  className="w-full object-cover"
                  alt={link.title ?? link.url}
                />
              )}

              <div className="p-3">
                <h3 className={cn("font-bold text-sm mb-1", theme.text)}>
                  {link.title ?? link.url}
                </h3>

                {link.description && (
                  <p
                    className={cn(
                      "text-xs line-clamp-2 opacity-75",
                      theme.text
                    )}
                  >
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
        <div
          className={cn(
            "text-center mt-12 text-xs opacity-50 font-medium",
            theme.text
          )}
        >
          Powered by LinkHub
        </div>
      </div>
    </div>
  );
}

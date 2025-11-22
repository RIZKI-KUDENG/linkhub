import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import MasonryClient from "@/components/fragments/MasonryClient";
import { Metadata } from "next";
import { ThemeKey, themes } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Mail, Globe, Link2 as LinkIcon } from "lucide-react";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa6";
import { unstable_cache } from "next/cache";

const getUserProfile = unstable_cache(
  async (username: string) => {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        links: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["user-profile-data"], // Cache Key (harus unik untuk fungsi ini)
  {
    revalidate: 60, // Revalidate setiap 60 detik (Cache Time-to-Live)
    tags: ["user-profile"], // Tags untuk invalidasi manual (opsional)
  }
);
const getSocialIcon = (url: string) => {
  const u = url.toLowerCase();
  if (u.includes("instagram")) return <FaInstagram />;
  if (u.includes("twitter") || u.includes("x.com")) return <FaTwitter />;
  if (u.includes("facebook")) return <FaFacebook />;
  if (u.includes("linkedin")) return <FaLinkedin />;
  if (u.includes("github")) return <FaGithub />;
  if (u.includes("mailto")) return <Mail />;
  return <Globe />;
};
const getEmbedUrl = (url: string) => {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Spotify
  const spMatch = url.match(
    /open\.spotify\.com\/(track|album|playlist)\/([\w]+)/
  );
  if (spMatch)
    return `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}`;

  return null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  const user = await getUserProfile(username);

  if (!user) {
    return {
      title: "User tidak ditemukan · LinkHub",
      description: "Profil tidak ditemukan.",
    };
  }
  const pageTitle = user.customTitle || `@${user.username} · LinkHub`;
  const pageDescription =
    user.customDescription ||
    (user.bio
      ? user.bio
      : `Lihat koleksi link, tools, dan portfolio dari @${user.username}.`);
  return {
    title: pageTitle,
    description: pageDescription,
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
  const user = await getUserProfile(username);
  if (!user) {
    notFound();
  }
  const themeKey = (user.theme as ThemeKey) || "default";
  const theme = themes[themeKey] || themes.default;
  const socialLinks = user.links.filter((l) => l.type === "SOCIAL");
  const contentLinks = user.links.filter((l) => l.type !== "SOCIAL");
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
          {contentLinks.map((link) => {
            // 1. RENDER EMBED
            if (link.type === "EMBED") {
              const embedUrl = getEmbedUrl(link.url);
              if (!embedUrl) return null; // Skip jika URL tidak valid

              return (
                <div
                  key={link.id}
                  className="mb-4 overflow-hidden rounded-xl shadow-md bg-black"
                >
                  <iframe
                    src={embedUrl}
                    className="w-full aspect-video"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                  {link.title && (
                    <div
                      className={cn(
                        "p-3 text-sm font-medium",
                        theme.card,
                        theme.text
                      )}
                    >
                      {link.title}
                    </div>
                  )}
                </div>
              );
            }

            // 2. RENDER CLASSIC LINK (Kode Lama)
            return (
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
            );
          })}

          {user.links.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              <p>Belum ada link yang ditampilkan.</p>
            </div>
          )}
        </MasonryClient>
      </div>
      {socialLinks.length > 0 && (
        <div className="max-w-2xl mx-auto mt-12 pb-8 w-full">
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={`/api/link/${link.id}/click`}
                target="_blank"
                className={cn(
                  "p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-sm",
                  theme.card,
                  theme.text
                )}
                title={link.title || link.url}
              >
                {getSocialIcon(link.url)}
              </a>
            ))}
          </div>
        </div>
      )}
      <div
        className={cn(
          "text-center pb-6 text-xs opacity-50 font-medium",
          theme.text
        )}
      >
        Powered by LinkHub
      </div>
    </div>
  );
}

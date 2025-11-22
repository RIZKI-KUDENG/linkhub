import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import MasonryClient from "@/components/fragments/MasonryClient";
import { Metadata } from "next";
import { ThemeKey, themes } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Mail, Globe, HeartHandshake } from "lucide-react";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaPaypal
} from "react-icons/fa6";
import { unstable_cache } from "next/cache";

// --- CACHED DATA FETCHING ---
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
  ["user-profile-data"],
  {
    revalidate: 60,
    tags: ["user-profile"],
  }
);

// --- HELPER FUNCTIONS ---
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

  // Spotify (Support Track, Album, Playlist, Episode)
  const spMatch = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([\w]+)/);
  if (spMatch) return `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}`;

  // Apple Music
  // Ubah 'music.apple.com' menjadi 'embed.music.apple.com'
  if (url.includes("music.apple.com")) {
    return url.replace("music.apple.com", "embed.music.apple.com");
  }

  // SoundCloud
  // Menggunakan Widget API SoundCloud
  if (url.includes("soundcloud.com")) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
  }

  return null;
};

// --- METADATA GENERATION ---
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

  // Gunakan Custom SEO jika ada
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
      title: pageTitle,
      description: pageDescription,
      images: [`/api/og?username=${user.username}`],
      url: `https://linkhub.app/u/${user.username}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`/api/og?username=${user.username}`],
    },
  };
}

// --- PAGE COMPONENT ---
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

  // --- LOGIKA TEMA (CUSTOM VS STANDARD) ---
  const isCustom = user.theme === 'custom';
  // Ambil tema standar sebagai fallback atau jika tidak custom
  const standardTheme = themes[user.theme as ThemeKey] || themes.default;

  const socialLinks = user.links.filter((l) => l.type === "SOCIAL");
  const contentLinks = user.links.filter((l) => l.type !== "SOCIAL");

  // SAFE VALUES: Menyiapkan nilai default string agar tidak null
  const safeBgColor = user.customBgColor || '#ffffff';
  const safeAccentColor = user.customAccentColor || '#000000';
  const safeFont = user.customFont || 'inherit';

  // 1. Style Container Utama (Background & Font)
  const containerStyle: React.CSSProperties = isCustom ? {
    backgroundColor: safeBgColor,
    backgroundImage: user.customBgImage ? `url(${user.customBgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Efek parallax sederhana
    fontFamily: safeFont,
    color: safeAccentColor,
  } : {};

  // 2. Style Kartu Link
  const cardStyle: React.CSSProperties = isCustom ? {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Sedikit transparan agar BG terlihat
    backdropFilter: 'blur(8px)', // Efek blur (glassmorphism)
    border: `1px solid ${safeAccentColor}20`, // Border tipis transparan (menggunakan safeAccentColor)
    color: safeAccentColor, // Warna teks mengikuti accent (Wajib string, tidak boleh null)
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  } : {};
  const supportButtonStyle: React.CSSProperties = isCustom ? {
    backgroundColor: safeAccentColor, // Warna solid (kebalikan dari card biasa)
    color: safeBgColor, // Teks kontras
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  } : {};

  // 3. Style Teks (Header, Bio, dll)
  // Jika custom, warna teks diatur di containerStyle (inherited).
  // Jika standard, gunakan class dari theme.ts.
  const textClass = !isCustom ? standardTheme.text : "";

  return (
    <div
      className={cn(
        "min-h-screen relative p-6 transition-colors duration-300 flex flex-col",
        !isCustom && standardTheme.bg // Gunakan class BG standard HANYA jika TIDAK custom
      )}
      style={containerStyle} // Terapkan inline style custom
    >
      <div className="max-w-2xl mx-auto mt-10 w-full flex-1">
        
        {/* --- PROFILE HEADER --- */}
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.image ? (
              <Image
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                src={user.image}
                alt={user.name || "Profile"}
                className={cn(
                  "w-full h-full rounded-full object-cover shadow-sm",
                  isCustom ? "border-2 border-white/50" : "border-2 border-slate-100"
                )}
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20",
                  !isCustom && [standardTheme.card, standardTheme.text] //
                )}
                style={isCustom ? cardStyle : {}}
              >
                {user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          <h1 className={cn("text-2xl font-bold mb-2", textClass)}>
            @{user.name}
          </h1>
          
          {user.bio && (
            <p className={cn("text-sm opacity-90 max-w-md mx-auto whitespace-pre-wrap", textClass)}>
              {user.bio}
            </p>
          )}
        </div>

        {/* --- LINKS GRID (MASONRY) --- */}
        <MasonryClient>
          {contentLinks.map((link) => {
            // A. RENDER EMBED (YouTube/Spotify)
            if (link.type === "EMBED") {
              const embedUrl = getEmbedUrl(link.url);
              if (!embedUrl) return null;

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
                        !isCustom && [standardTheme.card, standardTheme.text]
                      )}
                      style={isCustom ? cardStyle : {}}
                    >
                      {link.title}
                    </div>
                  )}
                </div>
              );
            }
            if (link.type === "SUPPORT") {
               return (
                 <a
                   key={link.id}
                   href={`/api/link/${link.id}/click`}
                   target="_blank"
                   className={cn(
                     "block mb-4 rounded-xl p-4 text-center font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-md",
                     // Jika tema standar, gunakan style tombol yang lebih mencolok (misal bg-rose-600)
                     !isCustom && "bg-rose-600 text-white hover:bg-rose-700 border-none"
                   )}
                   style={isCustom ? supportButtonStyle : {}}
                 >
                   <div className="flex items-center justify-center gap-2">
                      <HeartHandshake size={20} />
                      <span>{link.title ?? "Support Me"}</span>
                   </div>
                 </a>
               )
            }

            // B. RENDER CLASSIC LINK (Card)
            return (
              <a
                key={link.id}
                href={`/api/link/${link.id}/click`}
                target="_blank"
                className={cn(
                  "block mb-4 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02]",
                  !isCustom && [standardTheme.card, standardTheme.cardHover]
                )}
                style={isCustom ? cardStyle : {}} // Terapkan custom style kartu
              >
                {link.imageUrl && (
                  <div className="relative w-full h-40">
                    <Image
                        src={link.imageUrl}
                        alt={link.title ?? link.url}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-4">
                  <h3 className={cn("font-bold text-sm mb-1", textClass)}>
                    {link.title ?? link.url}
                  </h3>

                  {link.description && (
                    <p className={cn("text-xs line-clamp-2 opacity-80", textClass)}>
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            );
          })}

          {user.links.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed">
              <p>Belum ada link yang ditampilkan.</p>
            </div>
          )}
        </MasonryClient>
      </div>

      {/* --- SOCIAL LINKS (Footer) --- */}
      {socialLinks.length > 0 && (
        <div className="max-w-2xl mx-auto mt-12 pb-8 w-full">
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={`/api/link/${link.id}/click`}
                target="_blank"
                className={cn(
                  "p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center text-xl",
                  !isCustom && [standardTheme.card, standardTheme.text]
                )}
                style={isCustom ? cardStyle : {}}
                title={link.title || link.url}
              >
                {getSocialIcon(link.url)}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* --- BRANDING --- */}
      <div className={cn("text-center pb-6 text-xs opacity-60 font-medium", textClass)}>
        Powered by LinkHub
      </div>
    </div>
  );
}
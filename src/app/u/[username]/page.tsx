import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import MasonryClient from "@/components/fragments/MasonryClient";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import PublicLinkItem from "@/components/fragments/PublicLinkTheme";
import { ThemeKey, themes } from "@/lib/theme";

type UserProfile = {
  theme?: string | null;
  customBgColor?: string | null;
  customAccentColor?: string | null;
  customFont?: string | null;
  customBgImage?: string | null;
}

function getProfileStyles(user: UserProfile) {
  const isCustom = user.theme === "custom";
  const standardTheme = themes[user.theme as ThemeKey] || themes.default;

  if (!isCustom) {
    return {
      isCustom: false,
      standardTheme,
      containerStyle: {},
      cardStyle: {},
      textClass: standardTheme.text,
      bgClass: standardTheme.bg,
    };
  }

  // Logic Custom Theme
  const safeBgColor = user.customBgColor || "#ffffff";
  const safeAccentColor = user.customAccentColor || "#000000";
  const safeFont = user.customFont || "inherit";

  return {
    isCustom: true,
    standardTheme, // Tetap dikembalikan untuk fallback
    containerStyle: {
      backgroundColor: safeBgColor,
      backgroundImage: user.customBgImage ? `url(${user.customBgImage})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: safeFont,
      color: safeAccentColor,
    },
    cardStyle: {
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(8px)",
      border: `1px solid ${safeAccentColor}20`,
      color: safeAccentColor,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    textClass: "", // Custom theme mengatur warna text lewat container style
    bgClass: "",
  };
}

// --- 2. CACHED DATA FETCHING ---
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

// --- 3. PAGE COMPONENT (REFACTORED) ---
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

  // 1. Ekstraksi Logic Style (Satu baris ini menggantikan logic yang berantakan sebelumnya)
  const { isCustom, standardTheme, containerStyle, cardStyle, textClass, bgClass } = getProfileStyles(user);

  const socialLinks = user.links.filter((l) => l.type === "SOCIAL");
  const contentLinks = user.links.filter((l) => l.type !== "SOCIAL");

  return (
    <div
      className={cn(
        "min-h-screen relative p-6 transition-colors duration-300 flex flex-col",
        bgClass // Class BG dari tema standar
      )}
      style={containerStyle} // Inline style untuk tema custom
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
                  isCustom
                    ? "border-2 border-white/50"
                    : "border-2 border-slate-100"
                )}
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20",
                  !isCustom && [standardTheme.card, standardTheme.text]
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
            <p
              className={cn(
                "text-sm opacity-90 max-w-md mx-auto whitespace-pre-wrap",
                textClass
              )}
            >
              {user.bio}
            </p>
          )}
        </div>

        {/* --- LINKS GRID (MASONRY) --- */}
        <MasonryClient>
          {contentLinks.map((link) => (
            <PublicLinkItem
              key={link.id}
              link={link}
              theme={standardTheme}
              isCustom={isCustom}
              cardStyle={cardStyle}
              textClass={textClass}
            />
          ))}
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
              <PublicLinkItem
                key={link.id}
                link={link}
                theme={standardTheme}
                isCustom={isCustom}
                cardStyle={cardStyle}
                textClass={textClass}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- BRANDING --- */}
      <div
        className={cn(
          "text-center pb-6 text-xs opacity-60 font-medium",
          textClass
        )}
      >
        Powered by LinkHub
      </div>
    </div>
  );
}
// src/lib/profile-utils.ts (Disarankan buat file baru ini)
import { ThemeKey, themes } from "@/lib/theme";
import { User } from "@prisma/client"; // Sesuaikan import tipe User

export function getProfileStyles(user: User) {
  const isCustom = user.theme === "custom";
  const standardTheme = themes[user.theme as ThemeKey] || themes.default;

  // Nilai default yang aman (Safe Values)
  const styles = {
    container: {} as React.CSSProperties,
    card: {} as React.CSSProperties,
    button: {} as React.CSSProperties,
    textClass: !isCustom ? standardTheme.text : "",
    bgClass: !isCustom ? standardTheme.bg : "",
    isCustom,
    standardTheme,
  };

  if (isCustom) {
    const safeBgColor = user.customBgColor || "#ffffff";
    const safeAccentColor = user.customAccentColor || "#000000";
    const safeFont = user.customFont || "inherit";

    // 1. Style Container Utama
    styles.container = {
      backgroundColor: safeBgColor,
      backgroundImage: user.customBgImage
        ? `url(${user.customBgImage})`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: safeFont,
      color: safeAccentColor,
    };

    // 2. Style Kartu Link (Glassmorphism)
    styles.card = {
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(8px)",
      border: `1px solid ${safeAccentColor}20`,
      color: safeAccentColor,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    };

    // 3. Style Tombol Support (Kontras)
    styles.button = {
      backgroundColor: safeAccentColor,
      color: safeBgColor,
      border: "none",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    };
  }

  return styles;
}
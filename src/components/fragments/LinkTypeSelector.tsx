"use client";

import { LayoutList, Share2, PlayCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type LinkType = "CLASSIC" | "SOCIAL" | "EMBED" | "SUPPORT";

interface LinkTypeSelectorProps {
  currentType: LinkType;
  onChange: (type: LinkType) => void;
}

export default function LinkTypeSelector({ currentType, onChange }: LinkTypeSelectorProps) {
  const types = [
    { id: "CLASSIC", label: "Tautan", icon: LayoutList },
    { id: "SOCIAL", label: "Sosial", icon: Share2 },
    { id: "EMBED", label: "Embed", icon: PlayCircle },
    { id: "SUPPORT", label: "Support", icon: Heart },
  ];

  return (
    <div className="space-y-2">
  <label className="block text-sm font-medium text-white/80">
    Tipe Konten
  </label>

  <div className="grid grid-cols-4 gap-2">
    {types.map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id as LinkType)}
        type="button"
        className={cn(
          `
          flex flex-col items-center justify-center gap-1 p-2
          rounded-lg border text-xs font-medium
          transition-all select-none
          `,
          currentType === item.id
            ? "bg-[#F5D547] text-black border-[#F5D547] shadow-sm"
            : "bg-black/20 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
        )}
      >
        <item.icon size={18} />
        <span className="text-[10px]">{item.label}</span>
      </button>
    ))}
  </div>

  <p className="text-xs text-white/50 mt-1">
    {currentType === "SOCIAL" && "Ikon kecil di footer profil."}
    {currentType === "EMBED" && "Video YouTube/Spotify diputar langsung."}
    {currentType === "SUPPORT" && "Tombol donasi/dukungan."}
  </p>
</div>

  );
}
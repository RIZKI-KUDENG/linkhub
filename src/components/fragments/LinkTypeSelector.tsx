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
      <label className="block text-sm font-medium text-slate-700">
        Tipe Konten
      </label>
      <div className="grid grid-cols-4 gap-2">
        {types.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id as LinkType)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all",
              currentType === item.id
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
            type="button" // Penting agar tidak submit form
          >
            <item.icon size={18} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {currentType === "SOCIAL" && "Ikon kecil di footer profil."}
        {currentType === "EMBED" && "Video YouTube/Spotify diputar langsung."}
        {currentType === "SUPPORT" && "Tombol donasi/dukungan."}
      </p>
    </div>
  );
}
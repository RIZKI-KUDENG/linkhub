"use client";

import { useRef } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/theme";
import { toast } from "sonner";

type ThemeSelectorProps = {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
};

export default function ThemeSelector({ register, setValue, watch }: ThemeSelectorProps) {
  const currentTheme = watch("theme");
  const customBgImage = watch("customBgImage");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("File terlalu besar (Max 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("customBgImage", reader.result as string);
      toast.success("Background berhasil diubah");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-3">
        Pilih Tema Tampilan
      </label>

      {/* THEME OPTIONS */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(themes).map(([key, themeData]) => (
          <label
            key={key}
            className={cn(
              "cursor-pointer block rounded-xl border p-1 transition-all bg-[#1a1a1a] hover:bg-white/5",
              currentTheme === key
                ? "border-[#F5D547] ring-2 ring-[#F5D547]/30"
                : "border-white/10"
            )}
          >
            <input type="radio" value={key} {...register("theme")} className="sr-only" />

            <div className="h-24 rounded-lg flex flex-col items-center justify-center gap-2 bg-black/30">
              <div
                className={cn(
                  "w-16 h-4 rounded text-[8px] flex items-center justify-center text-black font-semibold",
                  themeData.button
                )}
              >
                Tombol
              </div>

              <div className={cn("w-16 h-8 rounded p-1 text-[8px]", themeData.card)}>
                <div className="w-8 h-1 rounded-full bg-white/20 mb-1"></div>
              </div>
            </div>

            <p className="text-center text-xs font-medium mt-2 text-white/60">
              {themeData.name}
            </p>
          </label>
        ))}

        {/* Custom Option */}
        <label
          className={cn(
            "cursor-pointer block rounded-xl border p-1 transition-all bg-[#1a1a1a] hover:bg-white/5",
            currentTheme === "custom"
              ? "border-[#F5D547] ring-2 ring-[#F5D547]/30"
              : "border-white/10"
          )}
        >
          <input type="radio" value="custom" {...register("theme")} className="sr-only" />

          <div className="h-24 rounded-lg bg-black/40 flex items-center justify-center text-xs text-white/50 border border-white/10">
            Custom Design
          </div>

          <p className="text-center text-xs font-medium mt-2 text-white/60">
            Custom
          </p>
        </label>
      </div>

      {/* CUSTOM THEME EDITOR */}
      {currentTheme === "custom" && (
        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white/80">Kustomisasi Tampilan</h3>

          {/* Warna */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-white/60 mb-1 block">
                Warna Background
              </label>
              <input
                type="color"
                {...register("customBgColor")}
                className="h-10 w-full rounded border border-white/10 bg-black cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/60 mb-1 block">
                Warna Tombol / Accent
              </label>
              <input
                type="color"
                {...register("customAccentColor")}
                className="h-10 w-full rounded border border-white/10 bg-black cursor-pointer"
              />
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1 block">
              Jenis Font
            </label>
            <select
              {...register("customFont")}
              className="w-full p-2 bg-black/40 border border-white/10 rounded text-sm text-white"
            >
              <option value="Inter">Inter (Modern)</option>
              <option value="Serif">Serif (Klasik)</option>
              <option value="Monospace">Monospace (Code)</option>
              <option value="Cursive">Handwriting</option>
            </select>
          </div>

          {/* Upload Background */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1 block">
              Background Image
            </label>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleBgUpload}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white hover:bg-white/10 transition"
              >
                Upload Gambar
              </button>

              {customBgImage && (
                <button
                  type="button"
                  onClick={() => setValue("customBgImage", "")}
                  className="text-red-400 text-xs hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>

            {customBgImage && (
              <div
                className="mt-2 h-24 w-full rounded-lg bg-cover bg-center border border-white/10"
                style={{ backgroundImage: `url(${customBgImage})` }}
              ></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

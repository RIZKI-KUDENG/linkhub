"use client";

import { useRef } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { themes } from "@/lib/theme";
import { toast } from "sonner";

// Pastikan tipe ini match dengan schema form kamu
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
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(themes).map(([key, themeData]) => (
          <div key={key}>
            <label className={cn("cursor-pointer block relative rounded-lg border-2 p-1 transition-all", currentTheme === key ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent hover:border-slate-200")}>
              <input type="radio" value={key} {...register("theme")} className="sr-only" />
              <div className={cn("h-24 rounded-md flex flex-col items-center justify-center gap-2", themeData.bg)}>
                <div className={cn("w-16 h-4 rounded text-[8px] flex items-center justify-center", themeData.button)}>Tombol</div>
                <div className={cn("w-16 h-8 rounded text-[8px] p-1", themeData.card)}>
                  <div className={cn("w-8 h-1 rounded-full mb-1 bg-current opacity-20")}></div>
                </div>
              </div>
              <p className="text-center text-xs font-medium mt-2 text-slate-600">{themeData.name}</p>
            </label>
          </div>
        ))}

        {/* Option Custom */}
        <label className={cn("cursor-pointer block relative rounded-lg border-2 p-1", currentTheme === 'custom' ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent hover:border-slate-200")}>
          <input type="radio" value="custom" {...register("theme")} className="sr-only" />
          <div className="h-24 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-300">
            Custom Design
          </div>
          <p className="text-center text-xs font-medium mt-2 text-slate-600">Custom</p>
        </label>
      </div>

      {/* CUSTOM EDITOR PANEL */}
      {currentTheme === 'custom' && (
        <div className="p-4 bg-slate-50 rounded-xl border space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-semibold text-slate-800">Kustomisasi Tampilan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Warna Background</label>
              <div className="flex items-center gap-2">
                <input type="color" {...register("customBgColor")} className="h-9 w-full cursor-pointer rounded border p-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Warna Tombol/Teks</label>
              <div className="flex items-center gap-2">
                <input type="color" {...register("customAccentColor")} className="h-9 w-full cursor-pointer rounded border p-1" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Jenis Font</label>
            <select {...register("customFont")} className="w-full p-2 border rounded text-sm">
              <option value="Inter">Inter (Modern)</option>
              <option value="Serif">Serif (Klasik)</option>
              <option value="Monospace">Monospace (Code)</option>
              <option value="Cursive">Handwriting</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Background Image</label>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
            <div className="flex gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-white border rounded text-xs shadow-sm hover:bg-slate-50">Upload Gambar</button>
              {customBgImage && <button type="button" onClick={() => setValue("customBgImage", "")} className="text-red-500 text-xs hover:underline">Hapus</button>}
            </div>
            {customBgImage && <div className="mt-2 h-24 w-full rounded-lg bg-cover bg-center border" style={{ backgroundImage: `url(${customBgImage})` }} />}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
import { Wand2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ThumbnailSectionProps {
  imageUrl: string | undefined;
  url: string;
  onImageChange: (url: string) => void;
  onFetchMetadata: () => Promise<void>;
  isFetching: boolean;
}

export default function ThumbnailSection({
  imageUrl,
  url,
  onImageChange,
  onFetchMetadata,
  isFetching,
}: ThumbnailSectionProps) {
  const [activeTab, setActiveTab] = useState<"scrape" | "custom">("scrape");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.warning("File terlalu besar (Max 500KB)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result as string);
      toast.success("Thumbnail berhasil diubah");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3 border rounded-xl p-4 bg-slate-50/50">
      <label className="block text-sm font-medium text-slate-700">
        Thumbnail Link
      </label>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-200 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab("scrape")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
            activeTab === "scrape"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500"
          )}
        >
          <Wand2 size={14} /> Otomatis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
            activeTab === "custom"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500"
          )}
        >
          <Upload size={14} /> Upload
        </button>
      </div>

      {/* Content */}
      {activeTab === "scrape" ? (
        <button
          type="button"
          onClick={onFetchMetadata}
          disabled={!url || isFetching}
          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isFetching ? (
            <span className="animate-pulse">Mengambil...</span>
          ) : (
            <>
              <Wand2 size={16} /> Ambil Metadata
            </>
          )}
        </button>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm text-slate-700 font-medium"
          >
            <Upload size={16} /> Pilih Gambar
          </button>
        </>
      )}

      {/* Preview */}
      {imageUrl && (
        <div className="relative mt-3 w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onImageChange("")}
            className="absolute top-2 right-2 p-1 bg-white/80 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

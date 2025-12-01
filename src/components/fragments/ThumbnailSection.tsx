"use client";

import { useState, useRef } from "react";
import { Wand2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.warning("File terlalu besar (Max 500KB)");
      return;
    }

    try {
      toast.loading("Mengupload gambar...");
      const cloudUrl = await uploadToCloudinary(file);
      onImageChange(cloudUrl);
      toast.success("Thumbnail berhasil diupload!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal upload gambar");
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div className="space-y-3 border border-white/10 rounded-xl p-4 bg-white/3 text-white">
  <label className="block text-sm font-medium text-white/80">
    Thumbnail Link
  </label>

  {/* Tab Switcher */}
  <div className="flex p-1 bg-black/20 rounded-lg border border-white/10">
    <button
      type="button"
      onClick={() => setActiveTab("scrape")}
      className={cn(
        `
        flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium 
        rounded-md transition-all
        `,
        activeTab === "scrape"
          ? "bg-[#F5D547] text-black shadow-sm"
          : "text-white/60 hover:text-white"
      )}
    >
      <Wand2 size={14} /> Otomatis
    </button>

    <button
      type="button"
      onClick={() => setActiveTab("custom")}
      className={cn(
        `
        flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium
        rounded-md transition-all
        `,
        activeTab === "custom"
          ? "bg-[#F5D547] text-black shadow-sm"
          : "text-white/60 hover:text-white"
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
      className="
        w-full flex items-center justify-center gap-2 py-2
        bg-black/20 border border-white/10
        rounded-lg text-sm font-medium text-white/80
        hover:bg-white/10 transition disabled:opacity-40
      "
    >
      {isFetching ? (
        <span className="animate-pulse text-white/70">Mengambil...</span>
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
        className="
          w-full flex items-center justify-center gap-2 py-2
          bg-black/20 border border-white/10
          rounded-lg text-sm font-medium text-white/80
          hover:bg-white/10 transition
        "
      >
        <Upload size={16} /> Pilih Gambar
      </button>
    </>
  )}

  {/* Preview */}
  {imageUrl && (
    <div className="
      relative mt-3 w-full h-32 rounded-lg overflow-hidden 
      border border-white/10 bg-black/30 group
    ">
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-full object-cover"
      />

      <button
        type="button"
        onClick={() => onImageChange("")}
        className="
          absolute top-2 right-2 p-1
          bg-black/60 text-white rounded-full
          opacity-0 group-hover:opacity-100 
          transition-opacity shadow-md
          hover:bg-red-500/80 hover:text-white
        "
      >
        <X size={14} />
      </button>
    </div>
  )}
</div>

  );
}

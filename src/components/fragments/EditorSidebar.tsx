"use client";

import { useEffect, useState, useRef } from "react";
import {
  X,
  Upload,
  Link as LinkIcon,
  Wand2,
  LayoutList,
  Share2,
  PlayCircle,
  Heart,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LinkForm = {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  type: "CLASSIC" | "SOCIAL" | "EMBED" | "SUPPORT";
  isSensitive: boolean;
  password?: string;
};

export default function EditorSidebar({
  open,
  onClose,
  editingId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LinkForm>({
    url: "",
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    type: "CLASSIC",
    isSensitive: false,
    password: "",
  });
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [activeTab, setActiveTab] = useState<"scrape" | "custom">("scrape"); // Tab state
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      if (!editingId) {
        setForm({
          url: "",
          title: "",
          description: "",
          imageUrl: "",
          category: "",
          type: "CLASSIC",
          isSensitive: false,
          password: "",
        });
        setActiveTab("scrape"); // Default tab
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/link/${editingId}`);
        const data = await res.json();
        setForm({
          url: data.url,
          title: data.title ?? "",
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
          category: data.category ?? "",
          type: data.type ?? "CLASSIC",
          isSensitive: data.isSensitive ?? false,
          password: data.password ?? "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (open) load();
  }, [editingId, open]);

  if (!open) return null;

  async function fetchMetadata() {
    if (!form.url) return;
    setIsFetchingMeta(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const meta = await res.json();
      setForm((f) => ({
        ...f,
        title: meta.title ?? f.title,
        description: meta.description ?? f.description,
        imageUrl: meta.image ?? f.imageUrl,
      }));
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil metadata. Coba masukkan manual.");
    } finally {
      setIsFetchingMeta(false);
    }
  }

  // Fungsi Handle Upload Gambar (Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (Maks 500KB agar database tidak berat)
    if (file.size > 500 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  async function handleSave() {
    setLoading(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/link/${editingId}` : "/api/link";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      onSaved();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  }
  type LinkType = LinkForm["type"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end isolate">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? "Edit Link" : "Tambah Link Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Tipe Konten
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "CLASSIC", label: "Tautan", icon: LayoutList },
                { id: "SOCIAL", label: "Sosial", icon: Share2 },
                { id: "EMBED", label: "Embed", icon: PlayCircle },
                { id: "SUPPORT", label: "Support", icon: Heart },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setForm((f) => ({ ...f, type: item.id as LinkType }))
                  }
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all",
                    form.type === item.id
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {form.type === "SOCIAL" &&
                "Akan muncul sebagai ikon kecil di footer profil."}
              {form.type === "EMBED" &&
                "Video YouTube atau Spotify akan diputar langsung di halaman."}
              {form.type === "SUPPORT" &&
                "Tombol khusus untuk Saweria, Trakteer, atau PayPal."}
            </p>
          </div>
          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Link URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon
                className="absolute left-3 top-2.5 text-slate-400"
                size={16}
              />
              <input
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="https://website-kamu.com"
                autoFocus
              />
            </div>
          </div>
          {/* --- BAGIAN KEAMANAN (BARU) --- */}
          <div className="space-y-3 border rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Keamanan & Privasi
            </h3>

            {/* Sensitive Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-slate-700">
                  Konten Sensitif (18+)
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.isSensitive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isSensitive: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={16} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  Password (Opsional)
                </span>
              </div>
              <input
                type="text"
                value={form.password || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Biarkan kosong jika publik"
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <p className="text-[10px] text-slate-400">
                User harus memasukkan password ini untuk membuka link.
              </p>
            </div>
          </div>
          {/* -------------------------- */}

          {/* Thumbnail Section (Tabs) */}
          <div className="space-y-3 border rounded-xl p-4 bg-slate-50/50">
            <label className="block text-sm font-medium text-slate-700">
              Thumbnail Link
            </label>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-200 rounded-lg">
              <button
                onClick={() => setActiveTab("scrape")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                  activeTab === "scrape"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Wand2 size={14} /> Otomatis (Scrape)
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                  activeTab === "custom"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Upload size={14} /> Upload Custom
              </button>
            </div>

            {/* Content per Tab */}
            {activeTab === "scrape" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Ambil gambar & judul otomatis dari URL website.
                </p>
                <button
                  onClick={fetchMetadata}
                  disabled={!form.url || isFetchingMeta}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isFetchingMeta ? (
                    <span className="animate-pulse">Sedang mengambil...</span>
                  ) : (
                    <>
                      {" "}
                      <Wand2 size={16} /> Ambil Metadata{" "}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Upload gambar dari perangkatmu (Maks 500KB).
                </p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-700 font-medium"
                >
                  <Upload size={16} /> Pilih Gambar
                </button>
              </div>
            )}

            {/* Preview Image */}
            {form.imageUrl && (
              <div className="relative mt-3 w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                  className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Hapus gambar"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Judul & Deskripsi */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Judul Link
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="Contoh: Portfolio Saya"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Kategori
              </label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="Contoh: Social Media, Work, dll"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Deskripsi (Opsional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm h-24 resize-none"
                placeholder="Tambahkan detail singkat..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.url}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
          >
            {loading ? "Menyimpan..." : "Simpan Link"}
          </button>
        </div>
      </aside>
    </div>
  );
}

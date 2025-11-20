"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type LinkForm = {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
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
  });
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  useEffect(() => {
    async function load() {
      if (!editingId) {
        setForm({
          url: "",
          title: "",
          description: "",
          imageUrl: "",
          category: "",
        });
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
    } finally {
      setIsFetchingMeta(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      if (editingId) {
        await fetch(`/api/link/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-[420px] bg-white h-full shadow-xl p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit Link" : "Tambah Link"}
          </h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            URL
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full mt-1 p-2 border rounded"
              placeholder="https://example.com"
            />
          </label>

          <div className="flex gap-2">
            <button
              onClick={fetchMetadata}
              className="px-3 py-2 bg-indigo-600 text-white rounded"
              disabled={isFetchingMeta}
            >
              {isFetchingMeta ? "Fetching..." : "Ambil Metadata"}
            </button>
            <button
              onClick={() =>
                setForm({
                  url: "",
                  title: "",
                  description: "",
                  imageUrl: "",
                  category: "",
                })
              }
              className="px-3 py-2 bg-slate-100 rounded"
            >
              Reset
            </button>
          </div>

          <label className="block text-sm">
            Title
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full mt-1 p-2 border rounded"
            />
          </label>

          <label className="block text-sm">
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full mt-1 p-2 border rounded h-24"
            />
          </label>

          <label className="block text-sm">
            Image URL
            <input
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              className="w-full mt-1 p-2 border rounded"
            />
          </label>

          <label className="block text-sm">
            Category
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full mt-1 p-2 border rounded"
              placeholder="tools, portfolio, dsb"
            />
          </label>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 rounded"
            >
              Batal
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

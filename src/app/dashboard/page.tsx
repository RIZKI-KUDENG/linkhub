"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LinkCard from "@/components/fragments/LinkCard";
import EditorSidebar from "@/components/fragments/EditorSidebar";
import ShareModal from "@/components/fragments/ShareModal";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import LoadingLinks from "./loading";

import useLinks from "@/hooks/useLinks";
import { redirect } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function DashboardPage() {
  const { data: session } = useSession();
  
  const { links, setLinks, loading, refetch } = useLinks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (links) {
      const sorted = [...links].sort((a, b) => a.sortOrder - b.sortOrder);
      setLinks(sorted);
    }
  }, [loading]);

  if(loading){
    return <LoadingLinks />
  }

  if (!session) {
    redirect("/login");
  }



  // ... Functions (openEditor, handleDragEnd, dll) - Bagian bawah tetap sama ...
  function openEditor(id?: string) {
    setEditingId(id ?? null);
    setIsSidebarOpen(true);
  }
  function closeEditor() {
    setEditingId(null);
    setIsSidebarOpen(false);
  }
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const previousLinks = [...links];
    const newArray = arrayMove(links, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));
    setLinks(newArray);
    try {
      const res = await fetch("/api/link/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: newArray.map((l) => ({ id: l.id, sortOrder: l.sortOrder })),
        }),
      });
      if (!res.ok) {
        throw new Error("Gagal menyimpan ke server");
      }

      toast.success("Urutan disimpan");
    } catch (err) {
      console.error("Reorder failed", err);
      setLinks(previousLinks);
      toast.error("Gagal menyimpan urutan link, perubahan dibatalkan.");
    }
  }

 

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
  <div>
    <h1 className="text-3xl font-extrabold tracking-tight">Dashboard LinkHub</h1>
    <p className="text-sm text-gray-400">Kelola moodboard link kamu</p>
  </div>

  <div className="flex items-center gap-3 flex-wrap">
    <button
      onClick={() => setIsShareOpen(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] border border-white/10 text-white hover:bg-white/5 transition"
    >
      <QrCode size={18} />
      <span className="hidden sm:inline">Share</span>
    </button>

    <button
      className="px-4 py-2 rounded-lg bg-[#F5D547] text-black font-semibold hover:bg-[#e6c53f] transition"
      onClick={() => openEditor()}
    >
      + Tambah Link
    </button>

    <button
      className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
      onClick={() => redirect(`/u/${session?.user.username}`)}
    >
      Profile
    </button>

    <a
      href="/dashboard/settings"
      className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
    >
      Settings
    </a>

    <button
      className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Logout
    </button>
  </div>
</header>


        <main>
          { links.length === 0 ? (
            <div className="text-center py-10">
              <p className="mb-4">Kamu belum punya link apa pun.</p>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={() => openEditor()}
              >
                Tambah Link Pertama
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-4">
                  {links.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onEdit={() => openEditor(link.id)}
                      onDelete={async () => {
                        const prev = [...links];
                        setLinks((s) => s.filter((x) => x.id !== link.id));
                        try {
                          await fetch(`/api/link/${link.id}`, {
                            method: "DELETE",
                          });
                        } catch (err) {
                          console.error(err);
                          setLinks(prev);
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </main>
      </div>

      <EditorSidebar
        open={isSidebarOpen}
        onClose={closeEditor}
        editingId={editingId}
        onSaved={() => {
          closeEditor();
          refetch();
        }}
      />

      {session?.user?.username && (
        <ShareModal
          username={session.user.username}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
        />
      )}
    </div>
  );
}
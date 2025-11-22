"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import LinkCard from "@/components/fragments/LinkCard";
import EditorSidebar from "@/components/fragments/EditorSidebar";
import ShareModal from "@/components/fragments/ShareModal"; 
import { QrCode } from "lucide-react"; 

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
  
  // 2. State untuk Modal Share
  const [isShareOpen, setIsShareOpen] = useState(false); 

  const sensors = useSensors(useSensor(PointerSensor));
  
  // ... useEffect & Session Check (Tidak berubah) ...
  useEffect(() => {
    if (links) {
      const sorted = [...links].sort((a, b) => a.sortOrder - b.sortOrder);
      setLinks(sorted);
    }
  }, [loading]);

  if (!session) {
    return (/* ... Login Screen ... */ <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-4">Masuk dulu sebelum mengelola Link</h2><button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => signIn("google")}>Login dengan Google</button></div></div>);
  }

  // ... Functions (openEditor, handleDragEnd, dll) ...
  function openEditor(id?: string) {
    setEditingId(id ?? null);
    setIsSidebarOpen(true);
  }
  function closeEditor() {
    setEditingId(null);
    setIsSidebarOpen(false);
  }
  async function handleDragEnd(event: DragEndEvent) { /* ... logika drag and drop ... */ 
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newArray = arrayMove(links, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));
    setLinks(newArray);
    try {
      await fetch("/api/link/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: newArray.map((l) => ({ id: l.id, sortOrder: l.sortOrder })),
        }),
      });
    } catch (err) {
      console.error("Reorder failed", err);
      refetch();
    }
  }

  const handleRedirect = () => {
    redirect(`/u/${session.user.username}`);
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard LinkHub</h1>
            <p className="text-sm text-slate-600">
              Kelola moodboard link kamu — drag & drop untuk susun ulang
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* 3. Tombol QR Code Baru */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
              title="Tampilkan QR Code"
            >
              <QrCode size={18} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              onClick={() => openEditor()}
            >
              + Tambah Link
            </button>
            
            {/* Tombol Lainnya */}
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              onClick={handleRedirect}
            >
              Profile
            </button>
             <a
              href="/dashboard/settings"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
            >
              Settings
            </a>
             <button
              className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </button>
          </div>
        </header>

        <main>
          {/* ... Main Content (List Links / DndContext) ... */}
           {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : links.length === 0 ? (
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

      {/* 4. Pasang Component Modal */}
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
"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import LinkCard from "@/components/fragments/LinkCard";
import EditorSidebar from "@/components/fragments/EditorSidebar";
import useLinks from "@/hooks/useLinks";
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

  const sensors = useSensors(useSensor(PointerSensor));
  useEffect(() => {
    if (links) {
      const sorted = [...links].sort((a, b) => a.sortOrder - b.sortOrder);
      setLinks(sorted);
    }
  }, [loading]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Masuk dulu sebelum mengelola Link
          </h2>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => signIn("google")}
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard LinkHub</h1>
            <p className="text-sm text-slate-600">
              Kelola moodboard link kamu — drag & drop untuk susun ulang
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => openEditor()}
            >
              + Tambah Link
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </button>
          </div>
        </header>

        <main>
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
    </div>
  );
}

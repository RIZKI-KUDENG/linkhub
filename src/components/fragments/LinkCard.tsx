"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Edit2, GripVertical, BarChart2 } from "lucide-react";
import Link from "next/link";

type Link = {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  sortOrder: number;
  clicks: number;
};

export default function LinkCard({
  link,
  onEdit,
  onDelete,
}: {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
  ref={setNodeRef}
  style={style}
  className="
    flex flex-col sm:flex-row 
    gap-4 p-4 rounded-2xl
    bg-[#111] border border-white/10 shadow-sm 
    hover:bg-[#181818] transition
    text-white
  "
>
  {/* LEFT – Image & Drag Handle */}
  <div className="flex items-start gap-3 w-full sm:w-auto">
    <div {...attributes} {...listeners} className="p-2 rounded cursor-grab text-white/50 hover:text-white transition">
      <GripVertical size={18} />
    </div>

    <div className="w-20 h-20 bg-black/30 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
      {link.imageUrl ? (
        <img
          src={link.imageUrl}
          alt={link.title ?? link.url}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="text-xs text-white/40 px-2 text-center">
          No Image
        </div>
      )}
    </div>
  </div>

  {/* RIGHT – Text & Actions */}
  <div className="flex-1 min-w-0">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate max-w-full sm:max-w-md text-white">
          {link.title ?? link.url}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <p className="text-xs truncate max-w-full sm:max-w-48 text-white/70">
            {link.description ?? link.url}
          </p>

          <div className="flex items-center gap-1 text-xs text-black bg-[#F5D547] px-2 py-0.5 rounded-full shadow">
            <BarChart2 size={12} />
            <span>{link.clicks} klik</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 items-center">
        <Link
          href={`/dashboard/links/${link.id}/analytics`}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
          title="Lihat Analitik"
        >
          <BarChart2 size={16} />
        </Link>

        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-[#F5D547] text-black hover:bg-[#e6c53f] transition"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>

    {/* URL */}
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="block text-xs text-[#F5D547] mt-2 break-all hover:underline"
    >
      {link.url}
    </a>
  </div>
</div>

  );
}

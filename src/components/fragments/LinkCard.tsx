"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Edit2, GripVertical, BarChart2 } from "lucide-react";

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
      className="flex items-center gap-4 bg-white shadow rounded p-3"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="p-2 rounded cursor-grab">
          <GripVertical size={18} />
        </div>

        <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
          {link.imageUrl ? (
            <img
              src={link.imageUrl}
              alt={link.title ?? link.url}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-xs text-slate-500 px-2 text-center">
              No Image
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold truncate max-w-md">
              {link.title ?? link.url}
            </h3>
            {/* <p className="text-xs text-slate-500 truncate max-w-md">
              {link.description ?? link.url}
            </p> */}
            <div className="flex items-center gap-4 mt-1">
               <p 
                 className="text-xs truncate max-w-48"
               >
                {link.description ?? link.url}
               </p>
               
               <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                 <BarChart2 size={12} />
                 <span>{link.clicks} klik</span>
               </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={onEdit}
              className="p-2 rounded hover:bg-slate-100"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded hover:bg-slate-100 text-red-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 break-all"
        >
          {link.url}
        </a>
      </div>
    </div>
  );
}

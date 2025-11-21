"use client"

import {  useEffect, useState } from "react"
import { useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import Image from "next/image";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Min 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, _"),
  name: z.string().min(1, "Nama wajib diisi"),
  bio: z.string().max(160).optional(),
  image: z.string().url("URL tidak valid").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;
type UserData = {
    id: string;
    username?: string | null;
    name?: string | null;
    bio?: string | null;
    image?: string | null;
  };

export default function SettingsPage(){
    const {data: session, update} = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);


const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
} = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
})
useEffect(() => {
    if (session?.user) {
      setValue("username", session.user.username || "");
      setValue("name", session.user.name || "");
      setValue("bio", session.user.bio || ""); 
      setValue("image", session.user.image || "");
      fetch("/api/settings/profile") 
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data: UserData) => { 
           const user = data.id ? data : session.user;
           setValue("username", user.username || "");
           setValue("name", user.name || "");
           setValue("bio", user.bio || "");
           setValue("image", user.image || "");
        })
        .catch((err) => {
            console.error("Gagal memuat profil:", err);
        });
    }
  }, [session, setValue]);
const imageUrl = watch("image");
const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error?.username) {
           alert(errorData.error.username[0]);
        } else {
           alert("Gagal menyimpan perubahan.");
        }
        return;
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          username: data.username,
          image: data.image,
        },
      });

      alert("Profil berhasil diperbarui!");
      router.refresh();
      
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Edit Profil</h1>
            <button 
                onClick={() => router.push("/dashboard")} 
                className="text-sm text-slate-500 hover:text-slate-900"
            >
                Kembali ke Dashboard
            </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-start gap-6">
             <div className="shrink-0 relative w-20 h-20 bg-slate-100 rounded-full overflow-hidden border">
               {imageUrl ? (
                 <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                   {session?.user?.name?.charAt(0) || "U"}
                 </div>
               )}
             </div>
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Foto Profil (URL)
                </label>
                <input
                  {...register("image")}
                  placeholder="https://..."
                  className="w-full p-2 border rounded-md text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan link gambar (misal dari Google Photos atau Imgur).
                </p>
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
             </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">linkhub.com/u/</span>
                <input
                {...register("username")}
                className="w-full pl-32 p-2 border rounded-md text-sm"
                placeholder="username"
                />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              {...register("name")}
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Nama Kamu"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bio Singkat
            </label>
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full p-2 border rounded-md text-sm resize-none"
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
            <div className="flex justify-between mt-1">
                {errors.bio && <p className="text-red-500 text-xs">{errors.bio.message}</p>}
                <p className="text-xs text-slate-400 ml-auto">Maks. 160 karakter</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

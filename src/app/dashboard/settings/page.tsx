"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import Image from "next/image";
import { themes, ThemeKey } from "@/lib/theme";
import { cn } from "@/lib/utils";

// 1. Schema Lengkap (Profil + SEO + Custom Appearance)
const profileSchema = z.object({
  // Data Profil Dasar
  username: z
    .string()
    .min(3, "Min 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, _"),
  name: z.string().min(1, "Nama wajib diisi"),
  bio: z.string().max(160).optional(),
  image: z.string().url("URL tidak valid").optional().or(z.literal("")),
  
  // Data Tema
  theme: z.string().optional(),
  
  // Data SEO
  customTitle: z.string().max(60).optional(),
  customDescription: z.string().max(160).optional(),

  // Data Custom Appearance (BARU)
  customFont: z.string().optional(),
  customBgColor: z.string().optional(),
  customAccentColor: z.string().optional(),
  customBgImage: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

type UserData = {
    id: string;
    username?: string | null;
    name?: string | null;
    bio?: string | null;
    image?: string | null;
    theme?: string | null;
    customTitle?: string | null;
    customDescription?: string | null;
    // Tambahan Type untuk fetch
    customFont?: string | null;
    customBgColor?: string | null;
    customAccentColor?: string | null;
    customBgImage?: string | null;
};

export default function SettingsPage(){
    const {data: session, update} = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // Ref untuk upload background image
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
    })

    // Variabel Watch (Pantau perubahan input real-time)
    const currentTheme = watch("theme"); 
    const imageUrl = watch("image");
    const customBgImage = watch("customBgImage"); // Watch untuk preview BG

    // Handle Upload Background Image Custom
    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { // Limit 2MB
          alert("File terlalu besar (Max 2MB)");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setValue("customBgImage", reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (session?.user) {
          // Set default value awal dari session (biar gak kosong saat loading)
          setValue("username", session.user.username || "");
          setValue("name", session.user.name || "");
          // ... dst
          
          // Fetch data lengkap dari DB
          fetch("/api/settings/profile") 
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch");
              return res.json();
            })
            .then((data: UserData) => { 
               const user = data.id ? data : session.user;
               // Profil
               setValue("username", user.username || "");
               setValue("name", user.name || "");
               setValue("bio", user.bio || "");
               setValue("image", user.image || "");
               setValue("theme", user.theme || "default");
               
               // SEO
               setValue("customTitle", user.customTitle || "");
               setValue("customDescription", user.customDescription || "");

               // Custom Appearance
               setValue("customFont", user.customFont || "Inter");
               setValue("customBgColor", user.customBgColor || "#ffffff");
               setValue("customAccentColor", user.customAccentColor || "#000000");
               setValue("customBgImage", user.customBgImage || "");
            })
            .catch((err) => {
                console.error("Gagal memuat profil:", err);
            });
        }
      }, [session, setValue]);

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
              bio: data.bio,
              theme: data.theme
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
          {/* --- BAGIAN PROFIL --- */}
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

          {/* --- BAGIAN TEMA --- */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Pilih Tema Tampilan
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(themes).map(([key, themeData]) => (
                <div key={key}>
                  <label 
                    className={cn(
                      "cursor-pointer block relative rounded-lg border-2 p-1 transition-all",
                      currentTheme === key 
                        ? "border-indigo-600 ring-2 ring-indigo-100" 
                        : "border-transparent hover:border-slate-200"
                    )}
                  >
                    <input
                      type="radio"
                      value={key}
                      {...register("theme")}
                      className="sr-only"
                    />
                    <div className={cn("h-24 rounded-md flex flex-col items-center justify-center gap-2", themeData.bg)}>
                       <div className={cn("w-16 h-4 rounded text-[8px] flex items-center justify-center", themeData.button)}>
                          Tombol
                       </div>
                       <div className={cn("w-16 h-8 rounded text-[8px] p-1", themeData.card)}>
                          <div className={cn("w-8 h-1 rounded-full mb-1 bg-current opacity-20")}></div>
                       </div>
                    </div>
                    <p className="text-center text-xs font-medium mt-2 text-slate-600">
                      {themeData.name}
                    </p>
                  </label>
                </div>
              ))}

              {/* OPSI TEMA CUSTOM */}
              <label className={cn("cursor-pointer block relative rounded-lg border-2 p-1", currentTheme === 'custom' ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent hover:border-slate-200")}>
                 <input type="radio" value="custom" {...register("theme")} className="sr-only" />
                 <div className="h-24 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-300">
                    Custom Design
                 </div>
                 <p className="text-center text-xs font-medium mt-2 text-slate-600">Custom</p>
              </label>
            </div>

            {/* PANEL EDIT CUSTOM (Muncul jika theme === custom) */}
            {currentTheme === 'custom' && (
              <div className="p-4 bg-slate-50 rounded-xl border space-y-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-semibold text-slate-800">Kustomisasi Tampilan</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Warna Background</label>
                        <div className="flex items-center gap-2">
                            <input type="color" {...register("customBgColor")} className="h-9 w-full cursor-pointer rounded border p-1" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Warna Tombol/Teks</label>
                        <div className="flex items-center gap-2">
                            <input type="color" {...register("customAccentColor")} className="h-9 w-full cursor-pointer rounded border p-1" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Jenis Font</label>
                    <select {...register("customFont")} className="w-full p-2 border rounded text-sm">
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Serif">Serif (Klasik)</option>
                        <option value="Monospace">Monospace (Code)</option>
                        <option value="Cursive">Handwriting</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Background Image</label>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
                    
                    <div className="flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-white border rounded text-xs shadow-sm hover:bg-slate-50">
                            Upload Gambar
                        </button>
                        {customBgImage && (
                            <button type="button" onClick={() => setValue("customBgImage", "")} className="text-red-500 text-xs hover:underline">
                                Hapus
                            </button>
                        )}
                    </div>
                    {customBgImage && (
                        <div className="mt-2 h-24 w-full rounded-lg bg-cover bg-center border" style={{ backgroundImage: `url(${customBgImage})` }} />
                    )}
                </div>
              </div>
            )}
          </div>

          {/* --- BAGIAN SEO --- */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pengaturan SEO (Opsional)</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Custom Page Title
                    </label>
                    <input
                        {...register("customTitle")}
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Contoh: Rizki Kudeng - Digital Creator"
                    />
                    <div className="flex justify-between mt-1">
                        {errors.customTitle && <p className="text-red-500 text-xs">{errors.customTitle.message}</p>}
                        <p className="text-xs text-slate-400 ml-auto">Judul tab browser & Google</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Meta Description
                    </label>
                    <textarea
                        {...register("customDescription")}
                        rows={2}
                        className="w-full p-2 border rounded-md text-sm resize-none"
                        placeholder="Deskripsi singkat untuk mesin pencari..."
                    />
                    <div className="flex justify-between mt-1">
                        {errors.customDescription && <p className="text-red-500 text-xs">{errors.customDescription.message}</p>}
                        <p className="text-xs text-slate-400 ml-auto">Maks. 160 karakter</p>
                    </div>
                </div>
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
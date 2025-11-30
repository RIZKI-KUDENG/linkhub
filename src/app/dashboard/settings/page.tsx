"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeSelector from "./ThemeSelector";
import { toast } from "sonner";

// 1. Schema Lengkap (Profil + SEO + Custom Appearance)
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Min 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, _"),
  name: z.string().min(1, "Nama wajib diisi"),
  bio: z.string().max(160).optional(),
  image: z.string().url("URL tidak valid").optional().or(z.literal("")),
  theme: z.string().optional(),
  customTitle: z.string().max(60).optional(),
  customDescription: z.string().max(160).optional(),
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
  customFont?: string | null;
  customBgColor?: string | null;
  customAccentColor?: string | null;
  customBgImage?: string | null;
};

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });
  const imageUrl = watch("image");

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
    const toastId = toast.loading("Menyimpan perubahan...");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error?.username) {
          toast.error(errorData.error.username[0], { id: toastId });
        } else {
          toast.error("Terjadi kesalahan jaringan.", { id: toastId });
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
          theme: data.theme,
        },
      });

      toast.success("Profil berhasil diperbarui!", { id: toastId });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
  <div className="max-w-xl mx-auto bg-[#111] rounded-2xl shadow-xl border border-white/10 p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold">Edit Profil</h1>

      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm text-white/50 hover:text-white transition"
      >
        Kembali ke Dashboard
      </button>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* FOTO PROFIL */}
      <div className="flex items-start gap-6">
        <div className="shrink-0 relative w-20 h-20 bg-black/40 border border-white/10 rounded-full overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-2xl font-bold">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-white/80 mb-1">Foto Profil (URL)</label>

          <input
            {...register("image")}
            placeholder="https://..."
            className="
              w-full p-2 bg-black/20 border border-white/10 rounded-lg text-sm
              placeholder:text-white/30 focus:ring-2 focus:ring-[#F5D547] focus:border-transparent
              outline-none
            "
          />

          <p className="text-xs text-white/40 mt-1">
            Masukkan link gambar (Google Photos, Imgur, dll).
          </p>

          {errors.image && (
            <p className="text-red-400 text-xs mt-1">{errors.image.message}</p>
          )}
        </div>
      </div>

      {/* USERNAME */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Username</label>

        <div className="relative">
          <span className="absolute left-3 top-2 text-white/40">linkhub.com/u/</span>

          <input
            {...register("username")}
            className="
              w-full pl-32 p-2
              bg-black/20 border border-white/10 rounded-lg text-sm
              placeholder:text-white/30
              focus:ring-2 focus:ring-[#F5D547]
            "
            placeholder="username"
          />
        </div>

        {errors.username && (
          <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* NAME */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Nama Lengkap</label>

        <input
          {...register("name")}
          className="
            w-full p-2 bg-black/20 border border-white/10 rounded-lg text-sm
            placeholder:text-white/30 focus:ring-2 focus:ring-[#F5D547]
          "
          placeholder="Nama Kamu"
        />

        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* BIO */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Bio Singkat</label>

        <textarea
          {...register("bio")}
          rows={3}
          className="
            w-full p-2 bg-black/20 border border-white/10 rounded-lg text-sm resize-none
            placeholder:text-white/30 focus:ring-2 focus:ring-[#F5D547]
          "
          placeholder="Ceritakan sedikit tentang dirimu..."
        />

        <div className="flex justify-between mt-1">
          {errors.bio && (
            <p className="text-red-400 text-xs">{errors.bio.message}</p>
          )}
          <p className="text-xs text-white/40 ml-auto">Maks. 160 karakter</p>
        </div>
      </div>

      {/* THEME SELECTOR */}
      <ThemeSelector register={register} setValue={setValue} watch={watch} />

      {/* SEO */}
      <div className="pt-4 border-t border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Pengaturan SEO (Opsional)</h2>

        <div className="space-y-4">
          {/* CUSTOM TITLE */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Custom Page Title</label>

            <input
              {...register("customTitle")}
              className="
                w-full p-2 bg-black/20 border border-white/10 rounded-lg text-sm
                placeholder:text-white/30 focus:ring-2 focus:ring-[#F5D547]
              "
              placeholder="Contoh: Rizki Kudeng - Digital Creator"
            />

            <div className="flex justify-between mt-1">
              {errors.customTitle && (
                <p className="text-red-400 text-xs">{errors.customTitle.message}</p>
              )}
              <p className="text-xs text-white/40 ml-auto">Judul tab browser & Google</p>
            </div>
          </div>

          {/* META DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Meta Description</label>

            <textarea
              {...register("customDescription")}
              rows={2}
              className="
                w-full p-2 bg-black/20 border border-white/10 rounded-lg text-sm resize-none
                placeholder:text-white/30 focus:ring-2 focus:ring-[#F5D547]
              "
              placeholder="Deskripsi singkat untuk mesin pencari..."
            />

            <div className="flex justify-between mt-1">
              {errors.customDescription && (
                <p className="text-red-400 text-xs">{errors.customDescription.message}</p>
              )}
              <p className="text-xs text-white/40 ml-auto">Maks. 160 karakter</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full bg-[#F5D547] text-black font-semibold py-2.5 rounded-lg
            hover:bg-[#e6c53f] transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

    </form>
  </div>
</div>

  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lock, EyeOff, ArrowRight, PlayCircle, HeartHandshake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Helper icon (bisa dipindah ke utils jika mau dipakai ulang)
import { FaInstagram, FaTwitter, FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa6";
import { Mail, Globe } from "lucide-react";

const getSocialIcon = (url: string) => {
  const u = url.toLowerCase();
  if (u.includes("instagram")) return <FaInstagram />;
  if (u.includes("twitter") || u.includes("x.com")) return <FaTwitter />;
  if (u.includes("facebook")) return <FaFacebook />;
  if (u.includes("linkedin")) return <FaLinkedin />;
  if (u.includes("github")) return <FaGithub />;
  if (u.includes("mailto")) return <Mail />;
  return <Globe />;
};

// Helper Embed URL
const getEmbedUrl = (url: string) => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const spMatch = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([\w]+)/);
  if (spMatch) return `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}`;
  if (url.includes("music.apple.com")) return url.replace("music.apple.com", "embed.music.apple.com");
  if (url.includes("soundcloud.com")) return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
  return null;
};

type LinkItemProps = {
  link: any; // Gunakan tipe yang sesuai dari Prisma
  theme: any;
  isCustom: boolean;
  cardStyle: any;
  textClass: string;
};

export default function PublicLinkItem({ link, theme, isCustom, cardStyle, textClass }: LinkItemProps) {
  const [isRevealed, setIsRevealed] = useState(!link.isSensitive);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");

  // Handler Klik Utama
  const handleClick = (e: React.MouseEvent) => {
    // 1. Cek Sensitif
    if (!isRevealed) {
      e.preventDefault();
      const confirm = window.confirm("Link ini mungkin berisi konten sensitif (18+). Lanjutkan?");
      if (confirm) {
        setIsRevealed(true)
      if(link.password){
        setShowPasswordModal(true)
      }
      };
      return;
    }

    // 2. Cek Password
    if (link.password) { // Field 'hasPassword' kita inject di server component
      e.preventDefault();
      setShowPasswordModal(true);
      return;
    }
    
    // Jika aman, biarkan navigasi standar (href) berjalan
  };
  // Handler Unlock

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError("");
    
    try {
      const res = await fetch(`/api/link/${link.id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password salah");
      } else {
        // Redirect manual setelah unlock sukses
        window.open(data.url, "_blank");
        setShowPasswordModal(false);
        setPasswordInput("");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsUnlocking(false);
    }
  };

  // --- RENDER LOGIC ---

  // A. Jika belum di-reveal (Sensitive Blur)
  if (!isRevealed) {
    return (
      <div 
        onClick={handleClick}
        className={cn("relative mb-4 rounded-xl overflow-hidden cursor-pointer group", !isCustom && theme.card)}
        style={isCustom ? cardStyle : {}}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-4 transition-all group-hover:bg-black/20">
            <EyeOff size={24} className={cn("mb-2", isCustom ? "text-current" : "text-slate-700")} />
            <p className={cn("font-bold text-sm", isCustom ? "text-current" : "text-slate-900")}>Konten Sensitif</p>
            <p className={cn("text-xs opacity-75", isCustom ? "text-current" : "text-slate-600")}>Klik untuk melihat</p>
        </div>
        {/* Dummy Content Background */}
        <div className="opacity-20 p-4 h-24 flex items-center justify-between">
            <div className="w-12 h-12 bg-current rounded-lg" />
            <div className="flex-1 ml-4 h-4 bg-current rounded opacity-50" />
        </div>
      </div>
    );
  }

  // B. Render Normal (Sesuai Tipe)
  
  // 1. Embed
  if (link.type === "EMBED") {
    // Jika dipassword, jangan render iframe langsung, tampilkan placeholder Lock
    if (link.hasPassword) {
       return (
         <div onClick={handleClick} className={cn("mb-4 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer border border-dashed border-slate-300", !isCustom && theme.card)} style={isCustom ? cardStyle : {}}>
            <Lock size={24} className="mb-2 opacity-70" />
            <p className="font-medium text-sm">Konten Terkunci</p>
            {/* Modal Password */}
            <PasswordDialog 
                open={showPasswordModal} 
                onOpenChange={setShowPasswordModal}
                onSubmit={handleUnlock}
                loading={isUnlocking}
                error={error}
                value={passwordInput}
                onChange={setPasswordInput}
            />
         </div>
       )
    }
    
    const embedUrl = getEmbedUrl(link.url);
    return (
      <div className="mb-4 overflow-hidden rounded-xl shadow-md bg-black relative">
        <iframe
          src={embedUrl!}
          className="w-full"
          style={{ aspectRatio: link.url.includes('youtube') ? '16/9' : undefined, height: link.url.includes('youtube') ? undefined : '152px' }}
          allow="autoplay *; encrypted-media *; fullscreen *;"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Social & Classic & Support
  const href = link.hasPassword ? "#" : `/api/link/${link.id}/click`;
  
  // Render Logic khusus tipe
  let content;
  if (link.type === "SOCIAL") {
      return (
        <>
        <a href={href} onClick={handleClick} target="_blank" 
           className={cn("p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center text-xl", !isCustom && [theme.card, theme.text])}
           style={isCustom ? cardStyle : {}}
           title={link.title}>
           {getSocialIcon(link.url)}
        </a>
        <PasswordDialog open={showPasswordModal} onOpenChange={setShowPasswordModal} onSubmit={handleUnlock} loading={isUnlocking} error={error} value={passwordInput} onChange={setPasswordInput} />
        </>
      )
  } else if (link.type === "SUPPORT") {
      content = (
        <div className="flex items-center justify-center gap-2">
            {link.hasPassword ? <Lock size={18} /> : <HeartHandshake size={20} />}
            <span>{link.title ?? "Support Me"}</span>
        </div>
      );
  } else { // CLASSIC
      content = (
        <>
            {link.imageUrl && (
                <div className="relative w-full h-40">
                <Image src={link.imageUrl} alt={link.title} fill className="object-cover" sizes="50vw" />
                {link.hasPassword && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Lock size={32} />
                    </div>
                )}
                </div>
            )}
            <div className="p-4 flex items-center justify-between">
                <div>
                    <h3 className={cn("font-bold text-sm mb-1 flex items-center gap-2", textClass)}>
                        {link.title ?? "Link Terkunci"}
                        {link.hasPassword && !link.imageUrl && <Lock size={14} className="opacity-50" />}
                    </h3>
                    {link.description && <p className={cn("text-xs line-clamp-2 opacity-80", textClass)}>{link.description}</p>}
                </div>
                {!link.hasPassword && <ArrowRight size={16} className={cn("opacity-50", textClass)} />}
            </div>
        </>
      );
  }

  // Wrapper CLASSIC & SUPPORT
  const containerClasses = cn(
    "block mb-4 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] relative",
    link.type === "SUPPORT" && !isCustom && "bg-rose-600 text-white hover:bg-rose-700 border-none p-4 text-center font-bold",
    link.type === "CLASSIC" && !isCustom && [theme.card, theme.cardHover]
  );

  // Style khusus Support Custom (Inverted)
  const customSupportStyle = (isCustom && link.type === "SUPPORT") ? {
     ...cardStyle,
     backgroundColor: cardStyle.color, // Background jadi warna accent
     color: cardStyle.backgroundColor === 'rgba(255, 255, 255, 0.85)' ? '#ffffff' : '#000000', // Text jadi kontras (kasar, bisa diperbaiki logicnya)
     border: 'none'
  } : cardStyle;

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        target={link.hasPassword ? undefined : "_blank"}
        className={containerClasses}
        style={isCustom ? (link.type === "SUPPORT" ? customSupportStyle : cardStyle) : {}}
      >
        {content}
      </a>

      <PasswordDialog 
        open={showPasswordModal} 
        onOpenChange={setShowPasswordModal}
        onSubmit={handleUnlock}
        loading={isUnlocking}
        error={error}
        value={passwordInput}
        onChange={setPasswordInput}
      />
    </>
  );
}

// Sub-component Modal Password
function PasswordDialog({ open, onOpenChange, onSubmit, loading, error, value, onChange }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Masukkan Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <Input 
                        type="password" 
                        placeholder="Password..." 
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <Button onClick={onSubmit} disabled={loading} className="w-full">
                        {loading ? "Mengecek..." : "Buka Link"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
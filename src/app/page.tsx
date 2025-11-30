import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, BarChart3, Palette, Share2, ShieldCheck, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">

  {/* NAVBAR */}
  <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src={"/logo.jpg"}
          width={50}
          height={50}
          alt="Logo"
          className=" rounded-full"
        />
        <span className="text-xl font-bold font-poppins text-slate-900">
          Inspage
        </span>
      </div>

      <nav className="flex items-center gap-4">
        {session ? (
          <Link href="/dashboard">
            <Button className="bg-black hover:bg-zinc-900 text-white">
              Dashboard <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
              Masuk / Daftar
            </Button>
          </Link>
        )}
      </nav>
    </div>
  </header>

  {/* HERO */}
  <section className="relative pt-20 pb-28 bg-black text-white">
    <div className="max-w-4xl mx-auto px-6 text-center space-y-8">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5E117]/20 border border-[#F5E117]/30 text-[#F5E117] text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
        </span>
        Platform Link-in-Bio Modern
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
        Satu Link untuk <br />
        <span className="text-[#F5E117]">Semua Kontenmu.</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Gabungkan semua media sosial, karya, dan portofolio dalam satu halaman estetik. Bagikan dengan mudah & pantau performanya.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link href={session ? "/dashboard" : "/login"}>
          <Button size="lg" className="h-12 px-8 text-base bg-[#F5E117] hover:bg-yellow-400 text-black font-semibold">
            {session ? "Buka Dashboard" : "Buat Link Gratis"}
          </Button>
        </Link>

        <Link href="#features">
          <Button size="lg" variant="ghost" className="h-12 px-8 text-base text-white hover:bg-white/10">
            Pelajari Fitur
          </Button>
        </Link>
      </div>

    </div>
  </section>

  {/* FEATURES */}
  <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
    <div className="max-w-6xl mx-auto px-6">

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-black mb-4">Fitur yang Kamu Butuhkan</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Semua alat yang kamu perlukan untuk membangun personal branding profesional.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<BarChart3 className="text-[#F5E117]" size={24} />}
          title="Analitik Mendalam"
          desc="Pantau siapa saja yang mengunjungi profilmu dan link mana yang paling banyak diklik."
        />
        <FeatureCard 
          icon={<Palette className="text-[#F5E117]" size={24} />}
          title="Kustomisasi Tema"
          desc="Pilih warna, font, dan gaya sesuai karakter atau identitas brand kamu."
        />
        <FeatureCard 
          icon={<Share2 className="text-[#F5E117]" size={24} />}
          title="Berbagi Mudah"
          desc="Bagikan dengan link unik atau QR Code yang siap dipakai di Instagram & TikTok."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-[#F5E117]" size={24} />}
          title="Keamanan Terjamin"
          desc="Gunakan password protection untuk konten sensitif & private."
        />
        <FeatureCard 
          icon={<Layout className="text-[#F5E117]" size={24} />}
          title="Drag & Drop"
          desc="Atur ulang link semudah menarik dan melepas card."
        />
        <FeatureCard 
          icon={<ArrowRight className="text-[#F5E117]" size={24} />}
          title="Dan Banyak Lagi..."
          desc="Integrasi video, musik, form & banyak fitur baru dalam pengembangan."
        />
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="py-24 bg-white">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold text-black mb-6">Siap Membangun Profilmu?</h2>
      <p className="text-lg text-gray-600 mb-10">
        Bergabunglah dengan kreator yang telah mempercantik personal branding mereka menggunakan Inspage.
      </p>
      <Link href="/login">
        <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-black hover:bg-zinc-900 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
          Mulai Sekarang — Gratis
        </Button>
      </Link>
    </div>
  </section>

</div>

  );
}

// Komponen Kecil untuk Card Fitur
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
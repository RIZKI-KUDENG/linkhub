import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "./LoginButton";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/dashboard'); 
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold">Selamat Datang di LinkHub</h1>
        <p className="text-slate-500 pb-4">Buat profil link estetik kamu sekarang.</p>
        <LoginButton />
      </div>
    </div>
  );
}
